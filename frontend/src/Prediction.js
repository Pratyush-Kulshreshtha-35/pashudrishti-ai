import { useMemo, useState } from "react";
import { supabase } from "./supabase";
import "./Prediction.css";

function Prediction({ user }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const getConfidenceLabel = (value) => {
    if (!value) return "N/A";
    if (value > 0.9) return "Very high";
    if (value > 0.75) return "Good";
    if (value > 0.6) return "Medium";
    return "Low";
  };

  const formatFallbackLabel = (value) => {
    if (!value) return "Not detected";
    return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const cleanText = (value) => {
    if (!value) return "";
    return value
      .replace(/\*\*/g, "")
      .replace(/^\s*[-*]\s+/gm, "")
      .trim();
  };

  const parseAdvisory = (value) => {
    const text = cleanText(value);
    if (!text) return [];

    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...rest] = line.split(":");
        if (!rest.length) {
          return { label: "Note", value: line };
        }
        return { label: label.trim(), value: rest.join(":").trim() };
      });
  };

  const displayPercent = (value) => `${Math.round((value || 0) * 100)}%`;

  const upload = async () => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        setResult({ error: text || "Server error" });
        setLoading(false);
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch {
        setResult({ error: "Invalid JSON response" });
        setLoading(false);
        return;
      }

      if (!data || data.error) {
        setResult({
          error: data?.error || "Something went wrong",
        });
      } else {
        setResult(data);
        
        // Insert into Supabase
        if (user) {
          try {
            // 1. Create a generic animal record for this upload
            const { data: animalData, error: animalError } = await supabase
              .from('animals')
              .insert({
                owner_id: user.id,
                name: 'Uploaded Animal ' + new Date().toLocaleTimeString(),
                species: data.geminiPrediction?.animalType || 'unknown'
              })
              .select()
              .single();

            if (animalError) {
              console.error("Error inserting animal:", animalError);
            } else if (animalData) {
              // 2. Insert the prediction record
              const { error: predError } = await supabase
                .from('predictions')
                .insert({
                  animal_id: animalData.id,
                  owner_id: user.id,
                  image_url: file.name, // Just store filename for now since we don't have storage buckets set up
                  predicted_breed: data.finalPrediction?.breed || data.breedDisplay,
                  predicted_disease: data.finalPrediction?.disease || data.diseaseDisplay,
                  confidence_breed: data.confidence?.breed,
                  confidence_disease: data.confidence?.disease,
                  ai_source: data.finalPrediction?.source || 'local'
                });
                
              if (predError) {
                console.error("Error inserting prediction:", predError);
              } else {
                console.log("Successfully saved prediction to Supabase!");
              }
            }
          } catch (dbErr) {
            console.error("Database saving error:", dbErr);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setResult({ error: "Cannot connect to backend" });
    }

    setLoading(false);
  };

  return (
    <section className="prediction-view">
      <div className="tool-heading">
        <div>
          <span>Image analysis</span>
          <h2>Upload a livestock photo for AI detection</h2>
        </div>
      </div>

      <div className="analyzer-grid">
        <div className="upload-panel">
          <label 
            className={`drop-zone ${file ? "has-file" : ""} ${isDragging ? "is-dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Selected livestock preview" />
            ) : (
              <div>
                <strong>Select image</strong>
                <span>JPG, PNG, or camera image</span>
              </div>
            )}
          </label>

          {file && (
            <div className="file-summary">
              <strong>{file.name}</strong>
              <span>{Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB</span>
            </div>
          )}

          <button
            className="analyze-button"
            onClick={upload}
            disabled={loading}
            type="button"
          >
            {loading ? "Analyzing..." : "Analyze image"}
          </button>
        </div>

        <div className="result-panel">
          {!result && !loading && (
            <div className="result-empty">
              <strong>Results will appear here</strong>
              <p>Breed, disease, confidence, and details are shown after analysis.</p>
            </div>
          )}

          {loading && (
            <div className="result-empty loading-state">
              <span></span>
              <strong>Analyzing image</strong>
              <p>Checking breed and visible health signals.</p>
            </div>
          )}

          {result && (
            <div className="result-content">
              {result.error ? (
                <div className="error-card">
                  <strong>Analysis failed</strong>
                  <p>{result.error}</p>
                </div>
              ) : (
                <>
                  <div className="result-stats">
                    <div>
                      <span>Breed</span>
                      <strong>
                        {result.breedDisplay || formatFallbackLabel(result.breed)}
                      </strong>
                    </div>
                    <div>
                      <span>Disease</span>
                      <strong>
                        {result.diseaseDisplay || formatFallbackLabel(result.disease)}
                      </strong>
                    </div>
                  </div>

                  {result.confidence && (
                    <div className="confidence-grid">
                      <div>
                        <span>Breed confidence</span>
                        <strong>{displayPercent(result.confidence.breed)}</strong>
                        <small>
                          {getConfidenceLabel(result.confidence.breed)}
                        </small>
                      </div>
                      <div>
                        <span>Disease confidence</span>
                        <strong>{displayPercent(result.confidence.disease)}</strong>
                        <small>
                          {getConfidenceLabel(result.confidence.disease)}
                        </small>
                      </div>
                    </div>
                  )}

                  {result.details && typeof result.details === "object" && (
                    <div className="screening-note">
                      <span>{result.details.confidenceNote || "AI screening"}</span>
                      <p>{result.details.summary}</p>
                      {result.details.nextSteps?.length > 0 && (
                        <ul>
                          {result.details.nextSteps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {result.finalPrediction && (
                    <div className="comparison-panel">
                      <div className="final-result">
                        <span>Final result</span>
                        <h3>{result.finalPrediction.breed}</h3>
                        <p>{result.finalPrediction.disease}</p>
                      </div>
                    </div>
                  )}

                  {result.topPredictions && (
                    <div className="top-predictions">
                      <div>
                        <span>Breed alternatives</span>
                        {result.topPredictions.breed?.map((item) => (
                          <p key={item.label}>
                            <strong>{item.display}</strong>
                            <small>{displayPercent(item.confidence)}</small>
                          </p>
                        ))}
                      </div>
                      <div>
                        <span>Disease alternatives</span>
                        {result.topPredictions.disease?.map((item) => (
                          <p key={item.label}>
                            <strong>
                              {item.label === "healthy"
                                ? "No disease detected"
                                : item.display}
                            </strong>
                            <small>{displayPercent(item.confidence)}</small>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="details-block">
                    <span>AI advisory</span>
                    {parseAdvisory(result.advisory || result.details).length ? (
                      <div className="advisory-list">
                        {parseAdvisory(result.advisory || result.details).map(
                          (item, index) => (
                            <p key={`${item.label}-${index}`}>
                              <strong>{item.label}</strong>
                              <span>{item.value || "Not clear from image."}</span>
                            </p>
                          )
                        )}
                      </div>
                    ) : (
                      <pre>No details available</pre>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Prediction;
