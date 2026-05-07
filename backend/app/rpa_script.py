from playwright.sync_api import sync_playwright
import requests

def run_rpa():
    with sync_playwright() as p:
        # 1. Abrir navegador [cite: 37]
        browser = p.chromium.launch(headless=False) # Headless=False para el video de la demo
        page = browser.new_page()
        
        # 2. Buscar término en Wikipedia [cite: 37, 38]
        page.goto("https://es.wikipedia.org/wiki/Python_(lenguaje_de_programación)")
        
        # 3. Extraer primer párrafo [cite: 39]
        paragraph = page.locator("p").first.inner_text()
        print(f"Texto extraído: {paragraph[:50]}...")

        # 4. Enviar a tu API /assistant/summarize 
        api_url = "http://localhost:8000/assistant/summarize"
        response = requests.post(api_url, json={"text": paragraph})
        
        if response.status_code == 200:
            print(f"Resultado de IA: {response.json()['summary']}")
        
        browser.close()

if __name__ == "__main__":
    run_rpa()