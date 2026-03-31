import os
import json
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from core.config import settings
from services.decision_service import get_llm
from langchain_core.prompts import PromptTemplate

def extract_metadata_from_text(text: str) -> dict:
    """Uses LLM to deduce Year, Category, and Scheme status from the text."""
    llm = get_llm()
    prompt = PromptTemplate(
        template="""You are a document metadata extractor for an Indian Higher Education Department.
Read the following document text and extract the following metadata:
1. "year": The year this document was issued or is most relevant to (e.g., 2026). If unknown, return "Unknown".
2. "is_scheme": true if this document describes a specific government scheme or scholarship, false otherwise.
3. "category": A single word or short phrase categorizing the document (e.g., "Policy", "Regulation", "Scholarship", "General", "Notice").

Return EXACTLY a valid JSON object with these three keys. No markdown blocks, no other text.

DOCUMENT TEXT:
{text}
""",
        input_variables=["text"]
    )
    chain = prompt | llm
    
    # Analyze the first 10,000 characters which usually contain headers/dates
    safe_text = text[:10000]
    
    try:
        response = chain.invoke({"text": safe_text})
        content = response.content.strip()
        # Clean up potential markdown formatting around JSON
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        metadata = json.loads(content.strip())
        return {
            "year": str(metadata.get("year", "Unknown")),
            "is_scheme": bool(metadata.get("is_scheme", False)),
            "category": str(metadata.get("category", "General"))
        }
    except Exception as e:
        print(f"Failed to extract metadata: {e}")
        return {"year": "Unknown", "is_scheme": False, "category": "General"}

def load_and_split_document(file_path: str):
    """
    Loads a document (PDF, TXT, DOCX) and splits it into chunks.
    Also extracts smart metadata (Year, Category).
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
    elif ext == ".txt":
        loader = TextLoader(file_path, encoding='utf-8')
    elif ext in [".doc", ".docx"]:
        loader = Docx2txtLoader(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")
        
    documents = loader.load()
    
    # Extract full text for MongoDB storage
    full_text = "\n\n".join([doc.page_content for doc in documents])
    
    # Extract smart metadata using LLM
    smart_metadata = extract_metadata_from_text(full_text)
    
    # Split text into chunks to feed into the embedding model
    # 1000 characters per chunk keeps context without exceeding LLM context limits
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    
    chunks = text_splitter.split_documents(documents)
    
    # Inject smart metadata into every chunk for ChromaDB filtering
    for chunk in chunks:
        chunk.metadata["year"] = smart_metadata["year"]
        chunk.metadata["is_scheme"] = smart_metadata["is_scheme"]
        chunk.metadata["category"] = smart_metadata["category"]
        
    return full_text, chunks, smart_metadata
