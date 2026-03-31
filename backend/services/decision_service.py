from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from core.config import settings
from services.rag_service import query_database

def get_llm():
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set.")
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0.2,
        google_api_key=settings.GEMINI_API_KEY
    )

def summarize_document(text: str) -> str:
    """Summarizes a long document into a concise executive summary."""
    llm = get_llm()
    prompt = PromptTemplate(
        template="""You are an expert policy analyst. Read the following policy document and provide a concise executive summary (3-4 paragraphs) highlighting the main purpose, scope, and key directives.

DOCUMENT TEXT:
{text}

EXECUTIVE SUMMARY:""",
        input_variables=["text"]
    )
    chain = prompt | llm
    
    # Truncate text if it's absurdly long to prevent context overflow, though Gemini 1.5 handles huge context
    # Taking roughly the first 100,000 chars as a safe bet for quick summary
    safe_text = text[:100000]
    
    response = chain.invoke({"text": safe_text})
    return response.content

def extract_insights(text: str) -> list[str]:
    """Extracts 5-7 key actionable insights or strategic bullet points."""
    llm = get_llm()
    prompt = PromptTemplate(
        template="""You are a strategic advisor for the Higher Education Department. Read the document below and extract 5 to 7 key, actionable strategic insights or critical rules that decision makers must know.
Format your response exactly as a Markdown bulleted list using the '-' character for bullets. Do not include introductory text.

DOCUMENT TEXT:
{text}

KEY INSIGHTS:""",
        input_variables=["text"]
    )
    chain = prompt | llm
    safe_text = text[:100000]
    response = chain.invoke({"text": safe_text})
    
    # Parse the markdown bullets into a list of strings
    content = response.content.strip()
    bullets = [line.strip().lstrip('-').lstrip('*').strip() for line in content.split('\n') if line.strip().startswith('-') or line.strip().startswith('*')]
    
    # Fallback if parsing fails
    if not bullets:
        return [content]
    return bullets

def recommend_policies(text: str) -> str:
    """
    Finds related policies from the Vector DB and generates recommendations based on them.
    """
    llm = get_llm()
    
    # We take a sample of the document to query the vector DB to find *other* similar policies
    query_sample = text[:1500] 
    related_chunks = query_database(query_sample, k=3)
    
    context_text = "\n\n".join([f"Source: {doc.metadata.get('source', 'Unknown')}\n{doc.page_content}" for doc in related_chunks])
    
    prompt = PromptTemplate(
        template="""You are a policy recommendation engine. The user is currently reading a specific document. 
Below are excerpts from OTHER potentially related policies in the database.
Read these related excerpts and provide a brief recommendation to the decision maker on how these other policies might interact with or support the current document they are reading.

RELATED POLICIES EXCERPTS:
{context}

RECOMMENDATION:""",
        input_variables=["context"]
    )
    
    chain = prompt | llm
    response = chain.invoke({"context": context_text})
    return response.content
