import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


def scrape_single_keyword(keyword):
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--headless=new")  # Faster in headless mode
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    results = []
    try:
        print(f"🔍 Searching for: {keyword}")
        driver.get("https://www.google.com/maps")

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "searchboxinput"))
        )

        search_box = driver.find_element(By.ID, "searchboxinput")
        search_box.clear()
        search_box.send_keys(keyword)
        search_box.send_keys(Keys.ENTER)

        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located(
                (By.XPATH, '//div[contains(@aria-label, "Results for") or contains(@aria-label, "Search results")]')
            )
        )

        # Scroll to load all results
        previous_count = -1
        same_count_counter = 0
        for _ in range(50):
            scrollable_div = driver.find_element(
                By.XPATH,
                '//div[contains(@aria-label, "Results for") or contains(@aria-label, "Search results")]'
            )
            driver.execute_script('arguments[0].scrollTop = arguments[0].scrollHeight', scrollable_div)
            time.sleep(1.5)

            places_loaded = driver.find_elements(By.XPATH, '//a[contains(@href, "/place/")]')
            current_count = len(places_loaded)

            if current_count == previous_count:
                same_count_counter += 1
            else:
                same_count_counter = 0

            if same_count_counter >= 3:
                break

            previous_count = current_count

        print(f"📌 {keyword}: {len(driver.find_elements(By.XPATH, '//a[contains(@href, \"/place/\")]'))} places found.")

        # Extract details for each place
        for i in range(len(driver.find_elements(By.XPATH, '//a[contains(@href, "/place/")]'))):
            try:
                places = driver.find_elements(By.XPATH, '//a[contains(@href, "/place/")]')
                driver.execute_script("arguments[0].click();", places[i])

                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, '//h1[contains(@class, "DUwDvf")]'))
                )

                # Name
                name = driver.find_element(By.XPATH, '//h1[contains(@class, "DUwDvf")]').text \
                    if driver.find_elements(By.XPATH, '//h1[contains(@class, "DUwDvf")]') else None

                # Rating (numeric float)
                rating = None
                rating_elements = driver.find_elements(By.XPATH, '//span[contains(@aria-label,"stars")]')
                if rating_elements:
                    aria_label = rating_elements[0].get_attribute("aria-label")  # e.g., "4.3 stars"
                    if aria_label:
                        try:
                            rating = float(aria_label.split(" ")[0])
                        except ValueError:
                            rating = None

                # Address
                address = driver.find_element(By.XPATH, '//button[@data-item-id="address"]').text \
                    if driver.find_elements(By.XPATH, '//button[@data-item-id="address"]') else None

                # Phone
                phone = driver.find_element(
                    By.XPATH, '//button[contains(@aria-label, "Phone:") or @data-item-id="phone:tel"]'
                ).text if driver.find_elements(By.XPATH, '//button[contains(@aria-label, "Phone:") or @data-item-id="phone:tel"]') else None

                if name:
                    results.append({
                        "keyword": keyword,
                        "name": name,
                        "rating": rating,
                        "address": address,
                        "phone": phone
                    })

                # Back to list
                back_btn = driver.find_elements(By.XPATH, '//button[@aria-label="Back"]')
                if back_btn:
                    back_btn[0].click()
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_all_elements_located(
                            (By.XPATH, '//a[contains(@href, "/place/")]')
                        )
                    )

            except Exception as e:
                print(f"⚠️ {keyword} - Error: {e}")
                continue

    finally:
        driver.quit()
    return results


def scrape_google_maps(keywords, max_workers=3):
    all_results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(scrape_single_keyword, kw): kw for kw in keywords}

        for future in as_completed(futures):
            keyword = futures[future]
            try:
                data = future.result()
                all_results.extend(data)
                print(f"✅ Finished: {keyword} ({len(data)} places)")
            except Exception as e:
                print(f"❌ Failed {keyword}: {e}")

    with open("google_maps_data.json", "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=4)

    print(f"\n✅ Scraped total {len(all_results)} places across all keywords.")


if __name__ == "__main__":
    start_time = time.time()

    cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"]
    keywords_list = [f"wedding hall in {city}" for city in cities]

    scrape_google_maps(keywords_list, max_workers=3)

    end_time = time.time()
    print(f"⏱ Total execution time: {end_time - start_time:.2f} seconds")
