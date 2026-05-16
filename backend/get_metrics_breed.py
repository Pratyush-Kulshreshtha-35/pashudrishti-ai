import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

IMG_SIZE = 224
BATCH_SIZE = 32
test_dir = "../dataset_breed/test"

dataset = tf.keras.preprocessing.image_dataset_from_directory(
    test_dir,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    seed=123,
    shuffle=False
)

model = load_model("breed_model.h5")

y_true = []
for images, labels in dataset:
    y_true.extend(labels.numpy())

y_pred_probs = model.predict(dataset)
y_pred = np.argmax(y_pred_probs, axis=1)

cm = tf.math.confusion_matrix(y_true, y_pred).numpy()
class_names = dataset.class_names

print("\n--- 2D CONFUSION MATRIX ---")
print(f"{'':>22}" + "".join([f"{name[:8]:>10}" for name in class_names]))
for i, class_name in enumerate(class_names):
    row_str = f"{class_name:>22}"
    for j in range(len(class_names)):
        row_str += f"{cm[i, j]:>10}"
    print(row_str)

print("\n--- BREED MODEL CONFUSION MATRIX RESULTS ---")
for i, class_name in enumerate(class_names):
    tp = cm[i, i]
    fp = np.sum(cm[:, i]) - tp
    fn = np.sum(cm[i, :]) - tp
    tn = np.sum(cm) - tp - fp - fn
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    print(f"Class: {class_name.upper()}")
    print(f"True Positives (TP): {tp}")
    print(f"True Negatives (TN): {tn}")
    print(f"False Positives (FP): {fp}")
    print(f"False Negatives (FN): {fn}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1_score:.4f}")
    print("-" * 30)
