import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


def scrape_google_maps(keywords):
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    results = []

    for keyword in keywords:
        print(f"\n🔍 Searching for: {keyword}")
        driver.get("https://www.google.com/maps")

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "searchboxinput"))
        )

        # Search keyword
        search_box = driver.find_element(By.ID, "searchboxinput")
        search_box.clear()
        search_box.send_keys(keyword)
        search_box.send_keys(Keys.ENTER)

        # Wait for results container
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located(
                (By.XPATH, '//div[contains(@aria-label, "Results for") or contains(@aria-label, "Search results")]')
            )
        )

        # Scroll until end of results
        previous_count = -1
        same_count_counter = 0
        max_scroll_loops = 50  # Enough to load all results for one city

        for _ in range(max_scroll_loops):
            scrollable_div = driver.find_element(
                By.XPATH,
                '//div[contains(@aria-label, "Results for") or contains(@aria-label, "Search results")]'
            )
            driver.execute_script('arguments[0].scrollTop = arguments[0].scrollHeight', scrollable_div)
            time.sleep(2)

            places_loaded = driver.find_elements(By.XPATH, '//a[contains(@href, "/place/")]')
            current_count = len(places_loaded)

            if current_count == previous_count:
                same_count_counter += 1
            else:
                same_count_counter = 0

            if same_count_counter >= 3:
                break

            previous_count = current_count

        print(f"📌 Total places loaded for {keyword}: {len(driver.find_elements(By.XPATH, '//a[contains(@href, \"/place/\")]'))}")

        # Click each place and get details
        for i in range(len(driver.find_elements(By.XPATH, '//a[contains(@href, "/place/")]'))):
            try:
                places = driver.find_elements(By.XPATH, '//a[contains(@href, "/place/")]')
                driver.execute_script("arguments[0].click();", places[i])

                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, '//h1[contains(@class, "DUwDvf")]'))
                )

                # Extract details
                try:
                    name = driver.find_element(By.XPATH, '//h1[contains(@class, "DUwDvf")]').text
                except:
                    name = None

                try:
                    rating = driver.find_element(By.XPATH, '//span[contains(@aria-label,"stars")]').get_attribute("aria-label")
                except:
                    rating = None

                try:
                    address = driver.find_element(By.XPATH, '//button[@data-item-id="address"]').text
                except:
                    address = None

                try:
                    phone = driver.find_element(
                        By.XPATH, '//button[contains(@aria-label, "Phone:") or @data-item-id="phone:tel"]'
                    ).text
                except:
                    phone = None

                if name:
                    results.append({
                        "keyword": keyword,
                        "name": name,
                        "rating": rating,
                        "address": address,
                        "phone": phone
                    })

                # Go back to list
                back_btn = driver.find_elements(By.XPATH, '//button[@aria-label="Back"]')
                if back_btn:
                    back_btn[0].click()
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_all_elements_located(
                            (By.XPATH, '//a[contains(@href, "/place/")]')
                        )
                    )

            except Exception as e:
                print(f"⚠️ Error fetching details: {e}")
                continue

    driver.quit()

    # Save merged results
    with open("google_maps_data.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=4)

    print(f"\n✅ Scraped total {len(results)} places across all keywords. Data saved to google_maps_data.json")


# Example usage — change cities to get more results
# cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"]
# keywords_list = [f"wedding hall in {city}" for city in cities]
keywords_list = ["wedding hall in mumbai"]

scrape_google_maps(keywords_list)
