import os
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from core.config import settings

def get_vector_db():
    """
    Initializes and returns the Chroma Vector Database instance.
    """
    embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL_NAME)
    
    # Check if DB exists, otherwise it will create one upon adding documents
    db = Chroma(
        persist_directory=settings.CHROMA_DB_DIR, 
        embedding_function=embeddings
    )
    return db

def add_documents_to_db(chunks):
    """
    Adds split document chunks to the database.
    """
    db = get_vector_db()
    db.add_documents(chunks)
    db.persist()
    
def query_database(query: str, k: int = 4, filters: dict = None):
    """
    Searches the Vector DB for the top k most relevant document chunks based on the query.
    Optionally filters by metadata (e.g., year, category, is_scheme).
    """
    db = get_vector_db()
    
    # Chroma accepts a dict for the `filter` kwarg
    if filters and len(filters) > 0:
        results = db.similarity_search(query, k=k, filter=filters)
    else:
        results = db.similarity_search(query, k=k)
        
    return results

def search_and_highlight(query: str, results: list) -> list:
    """Takes vector search results and uses LLM to generate a specific highlighted snippet for the user's query."""
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0.2,
        google_api_key=settings.GEMINI_API_KEY
    )
    
    enhanced_results = []
    
    for doc in results:
        prompt = PromptTemplate(
            template="""You are an AI search assistant. The user searched for: "{query}"
Below is a chunk of text from a retrieved document. Extract the most relevant 1-2 sentences that directly answer or relate to the query. 
If the chunk is not highly relevant to the specific query, just summarize the chunk in one sentence.
Do not provide any introductory text, just the highlighted snippet.

DOCUMENT CHUNK:
{text}

HIGHLIGHT:""",
            input_variables=["query", "text"]
        )
        chain = prompt | llm
        
        try:
            highlight = chain.invoke({"query": query, "text": doc.page_content}).content.strip()
        except:
            highlight = doc.page_content[:200] + "..." # Fallback
            
        enhanced_results.append({
            "content": doc.page_content,
            "highlight": highlight,
            "metadata": doc.metadata
        })
        
    return enhanced_results

def generate_answer(query: str, context_documents: list, language: str = "English") -> str:
    """
    Passes context and the query to Google Gemini 1.5 via LangChain.
    """
    if not settings.GEMINI_API_KEY:
        return "System Configuration Error: GEMINI_API_KEY is not set in the environment variables."
        
    context_text = "\n\n".join([doc.page_content for doc in context_documents])
    
    # Define a prompt template specifically for policy/regulation querying
    prompt_template = """
    You are an expert assistant for the Higher Education Department. 
    Your role is to provide accurate and official-sounding answers based ONLY on the provided policy documents and guidelines context.
    If the context does not contain the answer to the user's question, politely state that you do not have enough information in the provided policies to answer correctly. Do NOT hallucinate.
    
    CRITICAL CONSTRAINT: You MUST translate and write your entire response natively in the requested language: {language}. Do not use English unless the requested language is English. Make sure technical terms are appropriately translated or transliterated.

    CONTEXT:
    {context}

    USER QUERY: {query}
    
    DETAILED ANSWER IN {language}:
    """
    
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "query", "language"])
    
    # Initialize the Gemini model
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0.2, # Low temperature for factual consistency
        google_api_key=settings.GEMINI_API_KEY
    )
    
    # Create the chain and execute
    chain = prompt | llm
    
    try:
        response = chain.invoke({"context": context_text, "query": query, "language": language})
        return response.content
    except Exception as e:
        print(f"LLM Generation Error: {e}")
        return f"Sorry, there was an issue generating the answer. Reason: {str(e)}"
    
