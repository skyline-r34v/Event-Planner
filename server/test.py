import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


def scrape_wedmegood_cards(limit=500):
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    url = "https://www.wedmegood.com/vendors/all/wedding-venues/"
    driver.get(url)

    wait = WebDriverWait(driver, 15)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".VendorList")))

    seen_count = 0
    while True:
        cards = driver.find_elements(By.CSS_SELECTOR, ".VendorList [id^='card']")
        if len(cards) >= limit:
            break

        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)

        if len(cards) == seen_count:  # No new cards loaded
            break
        seen_count = len(cards)

    print(f"Total cards found: {len(cards)}")

    data = []
    for card in cards[:limit]:
        try:
            info = card.find_element(By.CSS_SELECTOR, ".vender-info")
        except:
            continue  # skip if vender-info missing

        try:
            name = info.find_element(By.CSS_SELECTOR, ".vendorCard-title").text.strip()
        except:
            name = ""

        try:
            address = info.find_element(By.CSS_SELECTOR, ".vendorCard-location").text.strip()
        except:
            address = ""

        try:
            rating = info.find_element(By.CSS_SELECTOR, ".vendorCard-rating").text.strip()
        except:
            rating = ""

        try:
            price_info = info.find_element(By.CSS_SELECTOR, ".vendorCard-price").text.strip()
        except:
            price_info = ""

        try:
            areas_info = info.find_element(By.CSS_SELECTOR, ".vendorCard-detail").text.strip()
        except:
            areas_info = ""

        data.append({
            "name": name,
            "address": address,
            "rating": rating,
            "price_info": price_info,
            "areas_info": areas_info
        })

    with open("wedding_venues_cards.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    driver.quit()
    print("Scraping completed! Data saved to wedding_venues_cards.json")


if __name__ == "__main__":
    scrape_wedmegood_cards(limit=500)
