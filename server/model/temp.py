import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


def load_cards_from_page(page_url, city_name, scroll_pause=4):
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")   # keep visible for debugging
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--start-maximized")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    wait = WebDriverWait(driver, 30)

    print(f"🌍 Opening: {page_url}")
    driver.get(page_url)

    try:
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".VendorList")))
        wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".VendorList [id^='card']")))
    except:
        print("⚠️ No VendorList found on this page.")
        driver.quit()
        return []

    prev_count = 0
    stagnant_scrolls = 0

    # ✅ Scroll until cards stop loading
    while stagnant_scrolls < 5:
        cards = driver.find_elements(By.CSS_SELECTOR, ".VendorList [id^='card']")
        print(f"   ↳ Found {len(cards)} cards (scrolling...)")
        if len(cards) == prev_count:
            stagnant_scrolls += 1
        else:
            stagnant_scrolls = 0
            prev_count = len(cards)

        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(scroll_pause)  # slower scrolling

    print(f"✅ Finished scrolling: {len(cards)} cards loaded on this page")
    data = []

    for idx, card in enumerate(cards, start=1):
        try:
            vendor = card.find_element(By.CSS_SELECTOR, ".vendor-card")
        except:
            continue

        try:
            link_el = vendor.find_element(By.CSS_SELECTOR, ".vendor-detail.h6")
            venue_name = link_el.get_attribute("title").strip()
            venue_url = "https://www.wedmegood.com" + link_el.get_attribute("href")
        except:
            venue_name, venue_url = "", ""

        rating = vendor.find_element(By.CSS_SELECTOR, ".StarRatingNew").text.strip() if vendor.find_elements(By.CSS_SELECTOR, ".StarRatingNew") else ""
        reviews = vendor.find_element(By.CSS_SELECTOR, ".review-cnt").text.strip() if vendor.find_elements(By.CSS_SELECTOR, ".review-cnt") else ""
        location = vendor.find_element(By.CSS_SELECTOR, ".info-icon p.vendor-detail").text.strip() if vendor.find_elements(By.CSS_SELECTOR, ".info-icon p.vendor-detail") else ""
        venue_type = vendor.find_element(By.CSS_SELECTOR, ".info-icon p[title]").get_attribute("title") if vendor.find_elements(By.CSS_SELECTOR, ".info-icon p[title]") else ""

        veg_plate_price, non_veg_plate_price = "", ""
        price_blocks = vendor.find_elements(By.CSS_SELECTOR, ".vendor-price .fcol")
        if len(price_blocks) >= 1:
            veg_plate_price = price_blocks[0].text.replace("\n", " ").strip()
        if len(price_blocks) >= 2:
            non_veg_plate_price = price_blocks[1].text.replace("\n", " ").strip()

        capacity, rooms = "", ""
        chips = vendor.find_elements(By.CSS_SELECTOR, ".v-center.margin-10 p[title]")
        for chip in chips:
            txt = chip.get_attribute("title")
            if "pax" in txt.lower():
                capacity = txt
            elif "room" in txt.lower():
                rooms = txt

        images = []
        img_tags = vendor.find_elements(By.CSS_SELECTOR, ".vendor-picture img")
        for img in img_tags:
            src = img.get_attribute("src")
            if src and "wedmegood.com" in src:
                images.append(src)

        print(f"      🏨 Card {idx}: {venue_name}")

        data.append({
            "venue_name": venue_name,
            "city": city_name,
            "url": venue_url,
            "rating": rating,
            "reviews": reviews,
            "location": location,
            "venue_type": venue_type,
            "capacity": capacity,
            "veg_plate_price": veg_plate_price,
            "non_veg_plate_price": non_veg_plate_price,
            "rooms": rooms,
            "about": "",
            "images": images
        })

    driver.quit()
    return data


def scrape_city(city_slug, city_name, max_pages=5):
    all_data = []
    base_url = f"https://www.wedmegood.com/vendors/{city_slug}/wedding-venues/?page={{}}"

    print(f"\n🏙️ Starting city: {city_name}")

    for page in range(1, max_pages + 1):
        page_url = base_url.format(page)
        print(f"\n➡️ City: {city_name} | Page {page}")
        page_data = load_cards_from_page(page_url, city_name)

        if not page_data:
            print(f"⚠️ No data on page {page}, stopping {city_name}")
            break

        all_data.extend(page_data)
        print(f"📊 Page {page} done | Found {len(page_data)} cards on this page | Total so far: {len(all_data)}")

    print(f"🎯 Finished {city_name} → {len(all_data)} total venues\n")
    return all_data


if __name__ == "__main__":
    cities = {
        "delhi-ncr": "Delhi NCR",
        "mumbai": "Mumbai",
        "chennai": "Chennai"
    }

    all_results = []

    # ✅ Run 2 workers
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(scrape_city, slug, clean_name, 3) for slug, clean_name in cities.items()]

        for future in as_completed(futures):
            all_results.extend(future.result())

    with open("wedding_venues.json", "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 ALL cities completed! Total venues scraped: {len(all_results)}")
