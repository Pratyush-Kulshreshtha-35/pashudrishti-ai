# PashuDrishti AI 🐄

**PashuDrishti AI** is an advanced livestock health intelligence platform designed to empower farmers and veterinarians. Using cutting-edge computer vision and natural language processing, it provides instant screening for livestock breeds and potential diseases from simple photographs.

![PashuDrishti Banner](https://img.shields.io/badge/PashuDrishti-AI-green?style=for-the-badge&logo=probot)

## 🌐 Live Demo

**Try it out here:** [https://pashudrishti-ai.netlify.app/](https://pashudrishti-ai.netlify.app/)

## 🌟 Key Features

- **📸 AI Image Analysis**: Instantly detect livestock breeds and identify visible signals of diseases (like Lumpy Skin Disease, etc.).
- **🤖 Health Assistant (Chatbot)**: A 24/7 AI-powered chatbot to answer livestock care questions and provide immediate guidance.
- **🔐 Secure Authentication**: Integrated with Supabase for secure user accounts and data management.
- **📊 Detailed Insights**: Get confidence scores and AI-generated advisory notes for every analysis.
- **📱 Responsive Dashboard**: A premium, modern UI designed for both desktop and mobile users.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vanilla CSS (Neubrutalist design)
- **Backend**: Python, Flask
- **Machine Learning**: TensorFlow (CNN Models), Google Gemini AI (for advanced advisory)
- **Database/Auth**: Supabase
- **Deployment**: Docker (ready for Hugging Face Spaces / Heroku)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.9+)
- Supabase Account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/pashudrishti-ai.git
   cd pashudrishti-ai
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

## 🧪 Testing

We have documented a comprehensive test plan covering all major modules.
See [test_cases.md](./test_cases.md) for detailed scenarios including:
- Authentication (Login/Signup/Logout)
- Image Prediction Logic
- Chatbot Interaction

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Developed with ❤️ for the farming community by **Pratyush Kulshreshtha**.*