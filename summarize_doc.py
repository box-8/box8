import argparse
import os
import sys

# Add the box8-fastapi directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "box8-fastapi"))

from crewai import Agent, Task, Crew
from crewai_tools import (PDFSearchTool,
                         DOCXSearchTool,
                         TXTSearchTool,
                         CSVSearchTool)
from app.utils.crewai_functions import choose_llm, choose_tool

DEFAULT_FILE = os.path.join("C:", "_prod", "box8", "box8-fastapi", "sharepoint", "gael.jaunin@gmail.com", "Cahier_des_Charges_Maison.pdf")

def create_summarization_crew(file_path, llm_name="openai"):
    # Get the LLM and tool using the existing functions
    llm = choose_llm(llm_name)
    print(llm)
    tool = PDFSearchTool(file_path)
    print(tool)
    # Create the researcher agent that will use RAG to analyze the document
    researcher = Agent(
        role='Research Analyst',
        goal='Thoroughly analyze the document and extract key information using RAG',
        backstory='You are an expert at analyzing documents and extracting the most important information',
        tools=[tool],
        llm=llm,
        verbose=True
    )
    
    # Create the writer agent that will create the summary
    writer = Agent(
        role='Technical Writer',
        goal='Create a clear and concise summary of the document',
        backstory='You are an expert at creating clear and concise summaries while maintaining important details',
        llm=llm,
        verbose=True
    )
    
    # Create tasks for the agents
    research_task = Task(
        description="""
        Analyze the provided document thoroughly using the RAG tool.
        Focus on:
        1. Main themes and key points
        2. Important details and findings
        3. Conclusions or recommendations
        
        Provide your findings in a structured format.
        """,
        expected_output="""
        A detailed analysis of the document containing:
        - Main themes and key points identified
        - Important details and findings extracted
        - Conclusions or recommendations found
        All information should be properly structured and organized.
        """,
        agent=researcher
    )
    
    writing_task = Task(
        description="""
        Using the research provided, create a comprehensive yet concise summary of the document.
        The summary should:
        1. Start with a brief overview
        2. Include all key points and main ideas
        3. Maintain a logical flow
        4. End with any important conclusions
        
        Format the summary in a clear, readable way.
        """,
        expected_output="""
        A clear, well-structured summary of the document that includes:
        - Brief overview
        - Key points and main ideas
        - Logical flow of information
        - Important conclusions
        The summary should be both comprehensive and concise.
        """,
        agent=writer
    )
    
    # Create and run the crew
    crew = Crew(
        agents=[researcher, writer],
        tasks=[research_task, writing_task],
        verbose=True
    )
    
    return crew

def main():
    parser = argparse.ArgumentParser(description='Summarize a document using CrewAI and RAG')
    parser.add_argument('--file_path', default=DEFAULT_FILE, help='Path to the document to summarize')
    parser.add_argument('--llm', default='openai', help='Name of the LLM to use (default: openai)')
    args = parser.parse_args()
    
    crew = create_summarization_crew(args.file_path, args.llm)
    result = crew.kickoff()
    
    print("\nDocument Summary:")
    print("================")
    print(result.raw)

if __name__ == "__main__":
    main()
