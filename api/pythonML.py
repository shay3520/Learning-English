import sys
import json
import joblib
import textstat
import nltk
from collections import Counter
import language_tool_python
import pandas as pd
import numpy as np

# Constants
# LABELS = {
#     0.0: "beginner", 0.5: "beginner+", 1.0: "intermediate", 1.5: "intermediate+", 2.0: "expert",
#     2.5: "expert+"
# }
# LEVEL_NUMERIC = {
#     "beginner": 0.0, "beginner+": 0.5, "intermediate": 1.0, "intermediate+": 1.5,
#     "expert": 2.0, "expert+": 2.5
# }


LABELS = {
    0.0: "beginner", 1.0: "intermediate", 2.0: "expert"
}
LEVEL_NUMERIC = {
    "beginner": 0.0,"intermediate": 1.0, "expert": 2.0
}

# Initialize the LanguageTool object
tool = language_tool_python.LanguageTool('en-US')

# Define functions
def calculate_syntactic_complexity(text):
    sentences = nltk.sent_tokenize(text)
    complex_sentence_count = sum(len(nltk.word_tokenize(sent)) > 15 for sent in sentences)
    return (complex_sentence_count / len(sentences)) * 100 if sentences else 0

def calculate_punctuation_diversity(text):
    punctuation_marks = set("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~")
    count = Counter(char for char in text if char in punctuation_marks)
    return len(count)

def extract_grammar_features(text):
    matches = tool.check(text)
    return len(matches) / len(text.split())

def count_advanced_words_ratio(text, cefr_dict):
    words = text.lower().split()
    count = sum(1 for word in words if cefr_dict.get(word, '') in ['C1', 'C2'])
    return count / len(words) if words else 0

# Load the CEFR vocabulary
cefr_vocab_path = 'cefrj-vocabulary-profile-1.5.csv'
cefr_vocab_df = pd.read_csv(cefr_vocab_path)
cefr_dict = pd.Series(cefr_vocab_df.CEFR.values, index=cefr_vocab_df.headword).to_dict()

# Predict function
def predict_sentence_level(sentence, model, cefr_dict):
    features = {
        "Gunning Fog Index": textstat.gunning_fog(sentence),
        "Syntactic Complexity Percentage": calculate_syntactic_complexity(sentence),
        "Punctuation Diversity": calculate_punctuation_diversity(sentence),
        "Errors": extract_grammar_features(sentence),
        "Advanced Lexical Features": count_advanced_words_ratio(sentence, cefr_dict)
    }
    feature_values = np.array([[features[f] for f in features]])
    prediction_numeric = model.predict(feature_values)[0]
    prediction_label = LABELS[prediction_numeric]
    return LEVEL_NUMERIC[prediction_label]


if __name__ == "__main__":
    # Read sentences from sys.argv
    sentences = json.loads(sys.argv[1])
    #sentences = ["This is a test sentence.", "The book’s central thesis, while provocative, is marred by a litany of speculative leaps and inconclusive evidence.", "The proliferation of pseudo-scientific claims in the media underscores the necessity for a more discerning and critically minded populace."]
    
    
    # Load the CEFR vocabulary
    cefr_vocab_path = 'cefrj-vocabulary-profile-1.5.csv'
    cefr_vocab_df = pd.read_csv(cefr_vocab_path)
    cefr_dict = pd.Series(cefr_vocab_df.CEFR.values, index=cefr_vocab_df.headword).to_dict()

    # Load the trained model
    model = joblib.load('gradient_boosting_classifier.joblib')

    # Calculate the mean level of the sentences
    levels = [predict_sentence_level(sentence, model, cefr_dict) for sentence in sentences]
    mean_level = np.mean(levels)

    # Find the closest level label
    closest_level_numeric = min(LEVEL_NUMERIC.values(), key=lambda x: abs(x - mean_level))
    closest_level = [label for label, num in LEVEL_NUMERIC.items() if num == closest_level_numeric][0]

    # Print the mean level
    print(closest_level)