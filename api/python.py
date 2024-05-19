
import sys
import json
import ast
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

# Parse input data
input_data = ast.literal_eval(sys.argv[1])

# Encode texts
embeddings = model.encode(input_data)

# Compute similarity
transformer_similarity = util.pytorch_cos_sim(embeddings[0], embeddings[1])
similarity_score = transformer_similarity.item()

# Prepare output data
output_data = {
    'similarity_score': similarity_score
}

# Serialize output data to JSON and print
print(json.dumps(output_data))
sys.stdout.flush()










# # import sys
# # import json
# # import ast
# # from sentence_transformers import SentenceTransformer, util
 
# # model = SentenceTransformer('all-MiniLM-L6-v2')
 
# # # Encode texts
# # #embeddings = model.encode(["astronomy", "Madonna is the best singer"])
# # input = model.encode(ast.literal_eval(sys.argv[1]))
# # # Compute similarity
# # output = input
# # transformer_similarity = util.pytorch_cos_sim(input[0], input[1])
# # data_to_pass_back= (f"Transformer-based Similarity: {transformer_similarity.item():.2f}")
# # output.append(data_to_pass_back)
# # print(json.dumps(output))
# # sys.stdout.flush()


# # data_to_pass_back = 'send this to node process'

# # input = ast.literal_eval(sys.argv[1])
# # output = input
# # output.append(data_to_pass_back)
# # print(json.dumps(output))
# # sys.stdout.flush()