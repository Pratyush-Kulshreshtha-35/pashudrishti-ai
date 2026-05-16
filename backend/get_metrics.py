import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

IMG_SIZE = 224
BATCH_SIZE = 32
train_dir = "../dataset_disease"

dataset = tf.keras.preprocessing.image_dataset_from_directory(
    train_dir,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    validation_split=0.2,
    subset="validation",
    seed=123,
    shuffle=True
)

model = load_model("disease_model.h5")

y_true = []
y_pred_probs = []
for images, labels in dataset:
    y_true.extend(labels.numpy())
    y_pred_probs.extend(model.predict_on_batch(images))

y_pred = np.argmax(y_pred_probs, axis=1)

# Use TensorFlow's built-in confusion matrix to avoid sklearn dependency
cm = tf.math.confusion_matrix(y_true, y_pred).numpy()
class_names = dataset.class_names

print("\n--- 2D CONFUSION MATRIX ---")
print(f"{'':>20}" + "".join([f"{name[:8]:>10}" for name in class_names]))
for i, class_name in enumerate(class_names):
    row_str = f"{class_name:>20}"
    for j in range(len(class_names)):
        row_str += f"{cm[i, j]:>10}"
    print(row_str)

print("\n--- CONFUSION MATRIX RESULTS ---")
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
