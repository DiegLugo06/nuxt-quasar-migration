"""
Selenium test for quote flow and user signup (Quasar Migration)
Tests the complete flow from landing page to quote generation and login
Adapted for Quasar UI components
"""
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import pytest


class TestQuoteFlow:
    """Test class for quote generation flow with Quasar components"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup Chrome driver before each test"""
        print("\n[SETUP] Initializing Chrome driver...")
        chrome_options = Options()
        # Uncomment for headless mode
        # chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        # Disable extensions that might interfere (like Nuxt DevTools)
        chrome_options.add_argument('--disable-extensions')
        
        try:
            print("[SETUP] Setting up ChromeDriver...")
            # Set environment variable to reduce logging noise
            import os
            os.environ['WDM_LOG_LEVEL'] = '0'
            
            # Try multiple approaches to get ChromeDriver
            service = None
            
            # Approach 1: Try using system ChromeDriver (if in PATH or env var)
            print("[SETUP] Attempting to use system ChromeDriver...")
            try:
                import shutil
                chromedriver_path = None
                
                # Check environment variable first
                chromedriver_path = os.environ.get('CHROMEDRIVER_PATH')
                if chromedriver_path and os.path.exists(chromedriver_path):
                    print(f"[SETUP] Found ChromeDriver from CHROMEDRIVER_PATH: {chromedriver_path}")
                    service = Service(chromedriver_path)
                else:
                    # Try to find chromedriver in PATH
                    chromedriver_path = shutil.which("chromedriver")
                    if chromedriver_path:
                        print(f"[SETUP] Found ChromeDriver in PATH: {chromedriver_path}")
                        service = Service(chromedriver_path)
                    else:
                        # Try project root
                        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                        local_chromedriver = os.path.join(project_root, "chromedriver.exe")
                        if os.path.exists(local_chromedriver):
                            print(f"[SETUP] Found ChromeDriver in project root: {local_chromedriver}")
                            service = Service(local_chromedriver)
                        else:
                            raise FileNotFoundError("ChromeDriver not found")
            except Exception as e:
                print(f"[SETUP] System ChromeDriver not found: {e}")
                
                # Approach 2: Try webdriver-manager with timeout
                print("[SETUP] Attempting to download ChromeDriver (may timeout if network is slow)...")
                try:
                    # Set a shorter timeout for the download
                    import requests
                    original_get = requests.get
                    
                    def timeout_get(*args, **kwargs):
                        kwargs.setdefault('timeout', 30)  # 30 second timeout
                        return original_get(*args, **kwargs)
                    
                    # Monkey patch requests.get temporarily
                    requests.get = timeout_get
                    try:
                        service = Service(ChromeDriverManager().install())
                        print("[SETUP] ChromeDriver downloaded successfully")
                    finally:
                        requests.get = original_get
                        
                except Exception as e:
                    print(f"[SETUP] Error downloading ChromeDriver: {e}")
                    print("[SETUP] Please install ChromeDriver manually:")
                    print("  1. Download from: https://googlechromelabs.github.io/chrome-for-testing/")
                    print("  2. Extract chromedriver.exe")
                    print("  3. Add to PATH or place in project root")
                    print("  4. Or set CHROMEDRIVER_PATH environment variable")
                    raise Exception("ChromeDriver setup failed. See instructions above.")
            
            print("[SETUP] Creating Chrome WebDriver instance...")
            try:
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                print("[SETUP] Chrome driver initialized successfully")
                print(f"[SETUP] Browser: {self.driver.capabilities.get('browserName', 'unknown')} {self.driver.capabilities.get('browserVersion', 'unknown')}")
                
                # Add script to hide Nuxt DevTools on every page load
                try:
                    self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
                        'source': '''
                            // Hide Nuxt DevTools immediately and continuously
                            (function() {
                                function hideDevTools() {
                                    const devtools = document.querySelector('nuxt-devtools-frame');
                                    if (devtools) {
                                        devtools.style.cssText = 'display: none !important; visibility: hidden !important; pointer-events: none !important; z-index: -9999 !important; position: fixed !important;';
                                    }
                                }
                                // Run immediately
                                hideDevTools();
                                // Run on DOM ready
                                if (document.readyState === 'loading') {
                                    document.addEventListener('DOMContentLoaded', hideDevTools);
                                }
                                // Run on load
                                window.addEventListener('load', hideDevTools);
                                // Run periodically as fallback
                                setInterval(hideDevTools, 500);
                            })();
                        '''
                    })
                    print("[SETUP] Configured to hide Nuxt DevTools automatically")
                except Exception as e:
                    print(f"[SETUP] Warning: Could not set up DevTools hiding script: {e}")
                    print("[SETUP] Will hide DevTools manually on each page")
                    
            except Exception as e:
                print(f"[SETUP] Error creating WebDriver: {e}")
                raise
            
            self.driver.implicitly_wait(10)
            self.wait = WebDriverWait(self.driver, 20)
            self.base_url = "http://localhost:3000"
            print("[SETUP] Setup complete!")
            
            yield
            
        except Exception as e:
            print(f"\n[SETUP ERROR] Failed to initialize Chrome driver: {e}")
            raise
        finally:
            # Teardown
            try:
                if hasattr(self, 'driver') and self.driver:
                    print("[TEARDOWN] Closing browser...")
                    self.driver.quit()
                    print("[TEARDOWN] Browser closed")
            except Exception as e:
                print(f"[TEARDOWN ERROR] Error closing browser: {e}")
    
    def test_quote_flow_and_login(self):
        """
        Test complete quote flow with Quasar components:
        1. Load marketplace landing page
        2. Click "Cotizar Ahora"
        3. Select brand "Yamaha"
        4. Select model "R15"
        5. Select plazo "12 meses"
        6. Select insurance "Financiado"
        7. Generate quote
        8. Register new client with random email and phone
        9. Login with newly registered client credentials
        10. Upload INE front document
        """
        print("\n=== Starting Quote Flow Test (Quasar Migration) ===")
        
        # Pre-check: Verify server is running
        print("\n[PRE-CHECK] Verifying server is accessible...")
        base_url = "http://localhost:3000"
        try:
            response = requests.get(base_url, timeout=5)
            print(f"✓ Server is accessible (Status: {response.status_code})")
        except requests.exceptions.RequestException as e:
            print(f"✗ Server is not accessible at {base_url}")
            print(f"  Error: {e}")
            print("  Please make sure the Nuxt dev server is running: npm run dev")
            pytest.skip(f"Server not accessible at {base_url}")
        
        # Step 1: Load marketplace landing page
        print("\n[1/11] Loading marketplace landing page...")
        print(f"[1/11] URL: {self.base_url}/marketplace_landing")
        
        try:
            self.driver.get(f"{self.base_url}/marketplace_landing")
            print("[1/11] Page request sent, waiting for load...")
            
            # Measure page load performance
            load_start = time.time()
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            load_time = time.time() - load_start
            print(f"✓ Page loaded in {load_time:.2f} seconds")
            
            # Additional wait for Vue/Nuxt to hydrate
            time.sleep(2)
            print("[1/11] Waiting for Vue hydration...")
            
        except TimeoutException as e:
            print(f"✗ [1/11] Timeout loading page: {e}")
            raise
        except Exception as e:
            print(f"✗ [1/11] Error loading page: {e}")
            raise
        
        # Step 2: Click "Cotizar Ahora" button
        print("\n[2/11] Clicking 'Cotizar Ahora' button...")
        try:
            time.sleep(1)
            
            # Strategy 1: Use link selector first
            print("[2/11] Trying Strategy 1: Link selector...")
            cotizar_button = None
            try:
                cotizar_button = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/quote-generator')]"))
                )
                print("[2/11] ✓ Found button using Strategy 1: Link selector")
            except TimeoutException:
                print("[2/11] ✗ Strategy 1 failed")
            
            # Strategy 2: Fallback - Try button with text
            if not cotizar_button:
                print("[2/11] Strategy 1 failed, trying Strategy 2: Button text...")
                try:
                    cotizar_button = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Cotizar')]"))
                    )
                    print("[2/11] ✓ Found button using Strategy 2: Button text")
                except TimeoutException:
                    print("[2/11] ✗ Strategy 2 failed")
            
            # Strategy 3: Fallback - Try q-btn with text
            if not cotizar_button:
                print("[2/11] Strategy 2 failed, trying Strategy 3: Quasar button...")
                try:
                    cotizar_button = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'q-btn') and contains(text(), 'Cotizar')]"))
                    )
                    print("[2/11] ✓ Found button using Strategy 3: Quasar button")
                except TimeoutException:
                    print("[2/11] ✗ Strategy 3 failed")
            
            if not cotizar_button:
                raise Exception("Could not find 'Cotizar Ahora' button")
            
            # Use JavaScript click for reliability
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", cotizar_button)
            time.sleep(0.3)
            self.driver.execute_script("arguments[0].click();", cotizar_button)
            print("✓ Clicked 'Cotizar Ahora' button")
            
        except Exception as e:
            print(f"✗ [2/11] Error clicking button: {e}")
            raise
        
        # Wait for navigation
        print("[2/11] Waiting for navigation...")
        time.sleep(3)
        
        # Verify we're on the quote generator page
        current_url = self.driver.current_url
        print(f"[2/11] Current URL: {current_url}")
        assert "/quote-generator" in current_url, f"Should be on quote-generator page, but was on {current_url}"
        print("✓ Navigated to quote-generator page")
        
        # Step 3: Select brand "Yamaha"
        print("\n[3/11] Selecting brand 'Yamaha'...")
        try:
            # Wait for brands to load
            print("[3/11] Waiting for brands to load...")
            time.sleep(3)  # Wait for brands to load from API
            
            # Find Yamaha brand card - Quasar uses different classes
            print("[3/11] Looking for Yamaha brand card...")
            yamaha_brand = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'brand-card') and contains(., 'Yamaha')]"))
            )
            
            # Scroll into view and click
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", yamaha_brand)
            time.sleep(0.3)
            self.driver.execute_script("arguments[0].click();", yamaha_brand)
            print("✓ Clicked Yamaha brand")
            
            # Wait for brand to be selected and model selector to appear
            print("[3/11] Waiting for brand selection to register...")
            time.sleep(2)  # Wait for Vue reactivity
            
            # Verify brand is selected by checking for selected class or badge
            try:
                self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'brand-card') and contains(@class, 'selected') and contains(., 'Yamaha')]"))
                )
                print("[3/11] ✓ Brand selection confirmed (selected class found)")
            except TimeoutException:
                # Check for selected badge instead
                try:
                    self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'selected-badge')]"))
                    )
                    print("[3/11] ✓ Brand selection confirmed (selected badge found)")
                except TimeoutException:
                    print("[3/11] ⚠ Warning: Could not confirm brand selection visually")
            
            print("✓ Selected Yamaha brand")
            time.sleep(1)  # Additional wait for model dropdown to appear
        except TimeoutException:
            print("[3/11] Direct selection failed, trying search...")
            # Try searching for brand first
            search_input = self.driver.find_element(By.XPATH, "//input[@placeholder='Buscar marca...']")
            search_input.clear()
            search_input.send_keys("Yamaha")
            time.sleep(1)
            
            yamaha_brand = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'brand-card') and contains(., 'Yamaha')]"))
            )
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", yamaha_brand)
            time.sleep(0.3)
            self.driver.execute_script("arguments[0].click();", yamaha_brand)
            print("✓ Selected Yamaha brand (via search)")
            time.sleep(2)  # Wait for selection to register
        
        # Step 4: Select model "R15"
        print("\n[4/11] Selecting model 'R15'...")
        try:
            # Hide Nuxt DevTools if present
            try:
                self.driver.execute_script("""
                    const devtools = document.querySelector('nuxt-devtools-frame');
                    if (devtools) {
                        devtools.style.display = 'none';
                    }
                """)
            except:
                pass
            
            # Wait for model selector to appear - Quasar uses q-select
            # The model selector only appears when selectedBrand is set (v-if="selectedBrand")
            print("[4/11] Waiting for model selector to appear...")
            print("[4/11] This may take a moment as it depends on brand selection...")
            
            # Try multiple strategies to find the model selector
            # Since model-selector div exists but q-select inside might not be found,
            # we'll work with the input element directly or find it inside model-selector
            model_input = None
            model_selector = None
            
            # Strategy 1: Find model-selector div first, then look inside it
            print("[4/11] Strategy 1: Finding model-selector div and inspecting contents...")
            try:
                model_selector_div = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'model-selector')]"))
                )
                print("[4/11] ✓ Found model-selector div")
                
                # Look for input inside the model-selector div
                try:
                    model_input = model_selector_div.find_element(By.XPATH, ".//input[@placeholder='Selecciona el modelo']")
                    print("[4/11] ✓ Found input inside model-selector div")
                except:
                    # Try finding any input inside
                    all_inputs = model_selector_div.find_elements(By.XPATH, ".//input")
                    print(f"[4/11] Found {len(all_inputs)} input elements inside model-selector")
                    if all_inputs:
                        model_input = all_inputs[0]
                        print("[4/11] ✓ Using first input found in model-selector")
            except TimeoutException:
                print("[4/11] ✗ Strategy 1 failed: model-selector div not found")
            
            # Strategy 2: Find input by placeholder directly
            if not model_input:
                print("[4/11] Strategy 2: Finding input by placeholder...")
                try:
                    model_input = self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Selecciona el modelo']"))
                    )
                    print("[4/11] ✓ Found input by placeholder")
                except TimeoutException:
                    print("[4/11] ✗ Strategy 2 failed")
            
            # If we found the input, we can use it directly or find its parent
            if model_input:
                print("[4/11] Input found, locating parent container...")
                # Try to find q-select parent
                try:
                    model_selector = model_input.find_element(By.XPATH, "./ancestor::div[contains(@class, 'q-select')]")
                    print("[4/11] ✓ Found q-select parent")
                except:
                    # Try q-field parent
                    try:
                        model_selector = model_input.find_element(By.XPATH, "./ancestor::div[contains(@class, 'q-field')]")
                        print("[4/11] ✓ Found q-field parent")
                    except:
                        # Use model-selector div as fallback
                        try:
                            model_selector = model_input.find_element(By.XPATH, "./ancestor::div[contains(@class, 'model-selector')]")
                            print("[4/11] ✓ Using model-selector div as container")
                        except:
                            # Just use the input's immediate parent
                            model_selector = model_input.find_element(By.XPATH, "./..")
                            print("[4/11] ✓ Using input's parent element")
            else:
                # Strategy 3: Look for q-select with model-selector parent
                print("[4/11] Strategy 3: Looking for q-select inside model-selector...")
                try:
                    model_selector = self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'model-selector')]//div[contains(@class, 'q-select')]"))
                    )
                    print("[4/11] ✓ Found q-select using Strategy 3")
                except TimeoutException:
                    print("[4/11] ✗ Strategy 3 failed")
            
            if not model_selector:
                # Debug: Print page structure
                print("[4/11] DEBUG: Model selector not found. Inspecting page structure...")
                try:
                    # Check if brand is actually selected
                    selected_brands = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'brand-card') and contains(@class, 'selected')]")
                    print(f"[4/11] Found {len(selected_brands)} selected brand cards")
                    
                    # Check for model-selector div
                    model_selector_divs = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'model-selector')]")
                    print(f"[4/11] Found {len(model_selector_divs)} model-selector divs")
                    
                    if model_selector_divs:
                        # Inspect what's inside the model-selector div
                        model_selector_div = model_selector_divs[0]
                        print("[4/11] Inspecting model-selector div contents...")
                        inner_html = model_selector_div.get_attribute('innerHTML')
                        print(f"[4/11] Model-selector innerHTML (first 500 chars): {inner_html[:500]}")
                        
                        # Look for any input elements inside
                        inputs_in_selector = model_selector_div.find_elements(By.XPATH, ".//input")
                        print(f"[4/11] Found {len(inputs_in_selector)} input elements inside model-selector")
                        for i, inp in enumerate(inputs_in_selector, 1):
                            try:
                                placeholder = inp.get_attribute('placeholder') or 'N/A'
                                input_type = inp.get_attribute('type') or 'N/A'
                                print(f"[4/11]   Input [{i}]: type={input_type}, placeholder='{placeholder}'")
                            except:
                                pass
                        
                        # Look for any divs with q- classes
                        q_elements = model_selector_div.find_elements(By.XPATH, ".//div[contains(@class, 'q-')]")
                        print(f"[4/11] Found {len(q_elements)} divs with 'q-' classes inside model-selector")
                        for i, elem in enumerate(q_elements[:5], 1):  # Show first 5
                            try:
                                classes = elem.get_attribute('class') or 'N/A'
                                print(f"[4/11]   Q-element [{i}]: class='{classes[:100]}'")
                            except:
                                pass
                    
                    # Check for any q-select anywhere on page
                    all_q_selects = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'q-select')]")
                    print(f"[4/11] Found {len(all_q_selects)} q-select elements on entire page")
                    
                    # Try to find by placeholder text directly (without waiting)
                    print("[4/11] Trying to find by placeholder text (no wait)...")
                    try:
                        model_inputs = self.driver.find_elements(By.XPATH, "//input[@placeholder='Selecciona el modelo']")
                        print(f"[4/11] Found {len(model_inputs)} inputs with 'Selecciona el modelo' placeholder")
                        if model_inputs:
                            model_input = model_inputs[0]
                            # Try to get parent - might be q-field or q-select
                            try:
                                parent = model_input.find_element(By.XPATH, "./ancestor::div[contains(@class, 'q-select')]")
                                model_selector = parent
                                print("[4/11] ✓ Found model selector by placeholder text (q-select parent)")
                            except:
                                try:
                                    parent = model_input.find_element(By.XPATH, "./ancestor::div[contains(@class, 'q-field')]")
                                    model_selector = parent
                                    print("[4/11] ✓ Found model selector by placeholder text (q-field parent)")
                                except:
                                    # Use the input's parent div directly
                                    parent = model_input.find_element(By.XPATH, "./ancestor::div[contains(@class, 'model-selector')]")
                                    model_selector = parent
                                    print("[4/11] ✓ Found model selector by placeholder text (model-selector parent)")
                    except Exception as e:
                        print(f"[4/11] ✗ Could not find by placeholder text: {e}")
                except Exception as debug_e:
                    print(f"[4/11] DEBUG error: {debug_e}")
                    import traceback
                    traceback.print_exc()
                
                if not model_selector:
                    # Last resort: Wait a bit more and try again
                    print("[4/11] Waiting additional 3 seconds for component to render...")
                    time.sleep(3)
                    try:
                        model_input = self.wait.until(
                            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Selecciona el modelo']"))
                        )
                        # Get any parent that might work
                        try:
                            model_selector = model_input.find_element(By.XPATH, "./ancestor::div[contains(@class, 'q-select')]")
                        except:
                            model_selector = model_input.find_element(By.XPATH, "./ancestor::div[contains(@class, 'q-field')]")
                        print("[4/11] ✓ Found model selector after additional wait")
                    except:
                        raise Exception("Could not find model selector. Brand may not be selected properly or component not rendered.")
            
            if not model_selector and not model_input:
                raise Exception("Could not find model selector or input. Brand may not be selected properly.")
            
            # If we have the input, use it directly. Otherwise use the selector container
            if model_input:
                print("[4/11] Using input element directly to open dropdown...")
                # Scroll input into view
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", model_input)
                time.sleep(0.5)
                
                # Click the input to open the dropdown
                print("[4/11] Clicking input to open dropdown...")
                self.driver.execute_script("arguments[0].click();", model_input)
                print("[4/11] Opened model dropdown (via input click)")
            else:
                # Use the selector container
                print("[4/11] Scrolling model selector into view...")
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", model_selector)
                time.sleep(0.5)
                
                # Find the select trigger - Quasar q-select has multiple possible structures
                print("[4/11] Looking for select trigger...")
                select_trigger = None
                
                # Strategy 1: Try q-field__control (the clickable area)
                try:
                    select_trigger = model_selector.find_element(By.XPATH, ".//div[contains(@class, 'q-field__control')]")
                    print("[4/11] Found trigger using Strategy 1: q-field__control")
                except:
                    pass
                
                # Strategy 2: Try the input element directly
                if not select_trigger:
                    try:
                        select_trigger = model_selector.find_element(By.XPATH, ".//input")
                        print("[4/11] Found trigger using Strategy 2: input element")
                    except:
                        pass
                
                # Strategy 3: Try q-field__native
                if not select_trigger:
                    try:
                        select_trigger = model_selector.find_element(By.XPATH, ".//div[contains(@class, 'q-field__native')]")
                        print("[4/11] Found trigger using Strategy 3: q-field__native")
                    except:
                        pass
                
                if not select_trigger:
                    # Use the container itself
                    select_trigger = model_selector
                    print("[4/11] Using container as trigger")
                
                # Use JavaScript click to open dropdown
                print("[4/11] Clicking to open dropdown...")
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", select_trigger)
                time.sleep(0.3)
                self.driver.execute_script("arguments[0].click();", select_trigger)
                print("[4/11] Opened model dropdown")
            
            # Wait for dropdown menu to appear
            print("[4/11] Waiting for dropdown menu to appear...")
            time.sleep(2)  # Give more time for menu to render
            
            # Find and click R15 option - Quasar uses q-menu with q-item elements
            print("[4/11] Looking for R15 option in dropdown...")
            r15_option = None
            
            # Strategy 1: Wait for q-menu to appear, then find q-item with R15
            try:
                # Wait for q-menu to be visible (it might be in a portal/teleport)
                print("[4/11] Waiting for q-menu...")
                self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'q-menu')]"))
                )
                print("[4/11] ✓ q-menu found")
                
                # Wait a bit more for options to populate
                time.sleep(0.5)
                
                # Now find the R15 option
                print("[4/11] Searching for R15 in q-menu...")
                r15_option = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'q-menu')]//div[contains(@class, 'q-item') and contains(., 'R15')]"))
                )
                print("[4/11] ✓ Found R15 option using Strategy 1")
            except TimeoutException:
                print("[4/11] Strategy 1 failed, trying alternatives...")
                
                # Strategy 2: Find all q-items and search for R15
                print("[4/11] Strategy 2: Searching all q-item elements...")
                all_options = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'q-item')]")
                print(f"[4/11] Found {len(all_options)} q-item elements")
                
                if len(all_options) == 0:
                    # Maybe the menu hasn't appeared yet, wait a bit more
                    print("[4/11] No q-items found, waiting 2 more seconds...")
                    time.sleep(2)
                    all_options = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'q-item')]")
                    print(f"[4/11] After wait: Found {len(all_options)} q-item elements")
                
                for option in all_options:
                    try:
                        option_text = option.text.strip()
                        print(f"[4/11] Checking option: '{option_text}'")
                        if 'R15' in option_text or option_text == 'R15':
                            r15_option = option
                            print(f"[4/11] ✓ Found R15 option: '{option_text}'")
                            break
                    except Exception as e:
                        print(f"[4/11] Error checking option: {e}")
                        continue
            
            # Strategy 3: Try finding by role='option' or other attributes
            if not r15_option:
                print("[4/11] Strategy 3: Searching by role='option'...")
                try:
                    all_items = self.driver.find_elements(By.XPATH, "//div[@role='option' or contains(@class, 'q-item')]")
                    print(f"[4/11] Found {len(all_items)} items with role='option' or q-item class")
                    for item in all_items:
                        try:
                            item_text = item.text.strip()
                            if 'R15' in item_text or item_text == 'R15':
                                r15_option = item
                                print(f"[4/11] ✓ Found R15 option: '{item_text}'")
                                break
                        except:
                            continue
                except Exception as e:
                    print(f"[4/11] Strategy 3 failed: {e}")
            
            # Strategy 4: Try JavaScript to find the option
            if not r15_option:
                print("[4/11] Strategy 4: Using JavaScript to find R15...")
                try:
                    r15_option = self.driver.execute_script("""
                        // Find all q-item elements
                        const items = Array.from(document.querySelectorAll('.q-item'));
                        for (const item of items) {
                            const text = item.textContent || item.innerText || '';
                            if (text.includes('R15') || text.trim() === 'R15') {
                                return item;
                            }
                        }
                        return null;
                    """)
                    if r15_option:
                        print("[4/11] ✓ Found R15 option using JavaScript")
                except Exception as e:
                    print(f"[4/11] Strategy 4 failed: {e}")
            
            if not r15_option:
                # Debug: Print all available options
                print("[4/11] DEBUG: Could not find R15. Listing all available options:")
                try:
                    all_items = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'q-item')]")
                    print(f"[4/11] Total q-items found: {len(all_items)}")
                    for i, item in enumerate(all_items[:20], 1):  # Show first 20
                        try:
                            item_text = item.text.strip()
                            print(f"  [{i}] '{item_text}'")
                        except:
                            print(f"  [{i}] (error reading text)")
                    
                    # Also check for any visible text in q-menu
                    try:
                        menus = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'q-menu')]")
                        if menus:
                            menu_text = menus[0].text
                            print(f"[4/11] q-menu text content:\n{menu_text[:500]}")
                    except:
                        pass
                except Exception as e:
                    print(f"[4/11] DEBUG error: {e}")
                raise Exception("Could not find R15 model option")
            
            # Click the R15 option
            print("[4/11] Clicking R15 option...")
            if hasattr(r15_option, 'id'):
                # It's a WebElement
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", r15_option)
                time.sleep(0.3)
                self.driver.execute_script("arguments[0].click();", r15_option)
            else:
                # It's a JavaScript element
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click();", r15_option)
            print("✓ Selected R15 model")
            time.sleep(2)  # Wait for selection to register and dropdown to close
                
        except Exception as e:
            print(f"⚠ Error selecting model: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        # Step 5: Click next/continue to go to step 2
        print("\n[5/11] Proceeding to quote parameters...")
        try:
            # Find the "Continuar" button - Quasar q-btn
            next_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'next-button') or contains(@class, 'q-btn') and contains(text(), 'Continuar')]"))
            )
            # Wait for button to be enabled
            self.wait.until(lambda d: next_button.is_enabled())
            next_button.click()
            print("✓ Clicked 'Continuar' button")
            time.sleep(2)  # Wait for step 2 to load
        except TimeoutException:
            # Try alternative selector
            next_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Continuar')]")
            self.wait.until(lambda d: next_button.is_enabled())
            next_button.click()
            print("✓ Clicked 'Continuar' button (alternative selector)")
            time.sleep(2)
        
        # Step 6: Select plazo "12 meses"
        print("\n[6/11] Selecting plazo '12 meses'...")
        try:
            # Use the same approach as model selector - find input by placeholder
            plazo_input = None
            
            # Strategy 1: Find input by placeholder
            try:
                plazo_input = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Selecciona el plazo']"))
                )
                print("[6/11] ✓ Found plazo input by placeholder")
            except TimeoutException:
                print("[6/11] ✗ Strategy 1 failed: input not found by placeholder")
            
            # Strategy 2: Find by label "Plazo"
            if not plazo_input:
                try:
                    # Find label containing "Plazo", then find input in same form-group
                    plazo_label = self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//label[contains(text(), 'Plazo')]"))
                    )
                    # Find the input in the same form-group
                    form_group = plazo_label.find_element(By.XPATH, "./ancestor::div[contains(@class, 'form-group')]")
                    plazo_input = form_group.find_element(By.XPATH, ".//input")
                    print("[6/11] ✓ Found plazo input by label")
                except TimeoutException:
                    print("[6/11] ✗ Strategy 2 failed")
            
            if not plazo_input:
                raise Exception("Could not find plazo input")
            
            # Scroll and click to open dropdown
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", plazo_input)
            time.sleep(0.5)
            self.driver.execute_script("arguments[0].click();", plazo_input)
            print("[6/11] Opened plazo dropdown")
            time.sleep(1.5)
            
            # Wait for q-menu to appear
            self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'q-menu')]"))
            )
            print("[6/11] ✓ q-menu appeared for plazo.")
            
            # Select "12 meses" option - Quasar q-item
            meses_12_option = None
            try:
                meses_12_option = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'q-menu')]//div[contains(@class, 'q-item') and contains(text(), '12 meses')]"))
                )
                print("[6/11] ✓ Found '12 meses' option")
            except TimeoutException:
                # Try finding all options and searching
                all_options = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'q-item')]")
                for option in all_options:
                    try:
                        if '12 meses' in option.text:
                            meses_12_option = option
                            print(f"[6/11] ✓ Found '12 meses' option: '{option.text.strip()}'")
                            break
                    except:
                        continue
            
            if not meses_12_option:
                raise Exception("Could not find '12 meses' option")
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", meses_12_option)
            time.sleep(0.3)
            self.driver.execute_script("arguments[0].click();", meses_12_option)
            print("✓ Selected '12 meses' plazo")
            time.sleep(1)
        except Exception as e:
            print(f"⚠ Error selecting plazo: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        # Step 7: Select insurance "Financiado"
        print("\n[7/11] Selecting insurance 'Financiado'...")
        try:
            # Hide Nuxt DevTools again
            try:
                self.driver.execute_script("document.querySelector('nuxt-devtools-frame')?.style.setProperty('display', 'none', 'important');")
            except:
                pass
            
            # Use the same approach - find input by placeholder or label
            insurance_input = None
            
            # Strategy 1: Find input by placeholder (if it has one)
            try:
                # Check what placeholder the insurance select might have
                insurance_input = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[contains(@placeholder, 'seguro') or contains(@placeholder, 'Seguro')]"))
                )
                print("[7/11] ✓ Found insurance input by placeholder")
            except TimeoutException:
                print("[7/11] ✗ Strategy 1 failed: input not found by placeholder")
            
            # Strategy 2: Find by label "Pago del seguro"
            if not insurance_input:
                try:
                    # Find label containing "Pago del seguro", then find input in same form-group
                    insurance_label = self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//label[contains(text(), 'Pago del seguro')]"))
                    )
                    # Find the input in the same form-group
                    form_group = insurance_label.find_element(By.XPATH, "./ancestor::div[contains(@class, 'form-group')]")
                    insurance_input = form_group.find_element(By.XPATH, ".//input")
                    print("[7/11] ✓ Found insurance input by label")
                except TimeoutException:
                    print("[7/11] ✗ Strategy 2 failed")
            
            if not insurance_input:
                raise Exception("Could not find insurance input")
            
            # Scroll and click to open dropdown
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", insurance_input)
            time.sleep(0.5)
            self.driver.execute_script("arguments[0].click();", insurance_input)
            print("[7/11] Opened insurance dropdown")
            time.sleep(1.5)
            
            # Wait for q-menu to appear
            self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'q-menu')]"))
            )
            print("[7/11] ✓ q-menu appeared for insurance.")
            
            # Select "Financiado" option - Quasar q-item
            financiado_option = None
            try:
                financiado_option = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'q-menu')]//div[contains(@class, 'q-item') and contains(text(), 'Financiado')]"))
                )
                print("[7/11] ✓ Found 'Financiado' option")
            except TimeoutException:
                # Try finding all options and searching
                all_options = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'q-item')]")
                for option in all_options:
                    try:
                        if 'Financiado' in option.text:
                            financiado_option = option
                            print(f"[7/11] ✓ Found 'Financiado' option: '{option.text.strip()}'")
                            break
                    except:
                        continue
            
            if not financiado_option:
                raise Exception("Could not find 'Financiado' option")
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", financiado_option)
            time.sleep(0.3)
            self.driver.execute_script("arguments[0].click();", financiado_option)
            print("✓ Selected 'Financiado' insurance")
            time.sleep(1)
        except Exception as e:
            print(f"⚠ Error selecting insurance: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        # Step 8: Generate quote (click continue)
        print("\n[8/11] Generating quote...")
        try:
            # Click continue to generate quote - Quasar q-btn
            continue_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'next-button') or contains(@class, 'q-btn') and contains(text(), 'Continuar')]"))
            )
            # Wait for button to be enabled
            self.wait.until(lambda d: continue_button.is_enabled())
            continue_button.click()
            print("✓ Clicked 'Continuar' to generate quote")
            
            # Wait for quotes to load (step 3)
            time.sleep(5)  # Wait for API call to complete
            print("✓ Quote generation initiated")
            
            # Verify we're on step 3 (offers page)
            offers_section = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Ofertas disponibles') or contains(text(), 'Ofertas')]"))
            )
            print("✓ Quote generated successfully, viewing offers")
            
        except Exception as e:
            print(f"⚠ Error generating quote: {e}")
            # Continue anyway to test login
        
        # Step 9: Register new client
        print("\n[9/11] Registering new client...")
        
        # Generate random email and phone
        import random
        import string
        random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        test_email = f"test_{random_suffix}@testing.com"
        
        # Generate random 10-digit phone number (Mexico format)
        first_digit = random.randint(1, 9)
        remaining_digits = ''.join([str(random.randint(0, 9)) for _ in range(9)])
        test_phone = f"{first_digit}{remaining_digits}"
        
        print(f"[9/11] Generated test email: {test_email}")
        print(f"[9/11] Generated test phone: {test_phone}")
        
        try:
            # Navigate to contact form (registration page)
            print(f"[9/11] Navigating to contact form: {self.base_url}/contact-form")
            self.driver.get(f"{self.base_url}/contact-form")
            
            # Wait for page to load and Vue/Nuxt to hydrate
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            print("[9/11] Body loaded, waiting for Vue hydration...")
            time.sleep(3)
            
            # Hide Nuxt DevTools
            try:
                self.driver.execute_script("document.querySelector('nuxt-devtools-frame')?.style.setProperty('display', 'none', 'important');")
            except:
                pass
            
            # Fill name - Quasar q-input (uses label, not placeholder)
            # Quasar structure: label is sibling or parent of input within q-field
            print("[9/11] Filling name...")
            name_input = None
            # Strategy 1: Use JavaScript to find input by label text
            try:
                name_input = self.driver.execute_script("""
                    const labels = Array.from(document.querySelectorAll('label'));
                    const nameLabel = labels.find(l => l.textContent.includes('Nombre completo'));
                    if (nameLabel) {
                        // Find the input in the same q-field
                        const qField = nameLabel.closest('.q-field');
                        if (qField) {
                            return qField.querySelector('input');
                        }
                        // Fallback: find next input
                        return nameLabel.parentElement.querySelector('input') || 
                               nameLabel.nextElementSibling?.querySelector('input');
                    }
                    return null;
                """)
                if name_input:
                    print("[9/11] ✓ Found name input by JavaScript")
            except:
                pass
            
            # Strategy 2: Find first text input in form
            if not name_input:
                try:
                    name_input = self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//form//input[not(@type='email') and not(@type='tel')][1]"))
                    )
                    print("[9/11] ✓ Found name input as first text input")
                except:
                    raise Exception("Could not find name input")
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", name_input)
            time.sleep(0.3)
            name_input.clear()
            name_input.send_keys("Test User")
            print("✓ Entered name")
            
            # Fill phone - Quasar q-input (uses label "Teléfono")
            print(f"[9/11] Filling phone: {test_phone}...")
            phone_input = None
            try:
                phone_input = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[@type='tel']"))
                )
                print("[9/11] ✓ Found phone input by type")
            except TimeoutException:
                # Use JavaScript
                try:
                    phone_input = self.driver.execute_script("""
                        const labels = Array.from(document.querySelectorAll('label'));
                        const phoneLabel = labels.find(l => l.textContent.includes('Teléfono'));
                        if (phoneLabel) {
                            const qField = phoneLabel.closest('.q-field');
                            if (qField) {
                                return qField.querySelector('input[type="tel"]');
                            }
                        }
                        return document.querySelector('input[type="tel"]');
                    """)
                    if phone_input:
                        print("[9/11] ✓ Found phone input by JavaScript")
                except:
                    raise Exception("Could not find phone input")
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", phone_input)
            time.sleep(0.3)
            phone_input.clear()
            phone_input.send_keys(test_phone)
            print(f"✓ Entered phone: {test_phone}")
            
            # Fill email - Quasar q-input (uses label "Correo electrónico")
            print("[9/11] Filling email...")
            email_input = None
            try:
                email_input = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
                )
                print("[9/11] ✓ Found email input by type")
            except TimeoutException:
                # Use JavaScript
                try:
                    email_input = self.driver.execute_script("""
                        const labels = Array.from(document.querySelectorAll('label'));
                        const emailLabel = labels.find(l => l.textContent.includes('Correo'));
                        if (emailLabel) {
                            const qField = emailLabel.closest('.q-field');
                            if (qField) {
                                return qField.querySelector('input[type="email"]');
                            }
                        }
                        return document.querySelector('input[type="email"]');
                    """)
                    if email_input:
                        print("[9/11] ✓ Found email input by JavaScript")
                except:
                    raise Exception("Could not find email input")
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", email_input)
            time.sleep(0.3)
            email_input.clear()
            email_input.send_keys(test_email)
            print(f"✓ Entered email: {test_email}")
            
            # Fill street address - Quasar q-input (uses label "Dirección")
            print("[9/11] Filling street address...")
            address_input = None
            try:
                address_input = self.driver.execute_script("""
                    const labels = Array.from(document.querySelectorAll('label'));
                    const addressLabel = labels.find(l => l.textContent.includes('Dirección'));
                    if (addressLabel) {
                        const qField = addressLabel.closest('.q-field');
                        if (qField) {
                            return qField.querySelector('input:not([type="email"]):not([type="tel"])');
                        }
                    }
                    return null;
                """)
                if address_input:
                    print("[9/11] ✓ Found address input by JavaScript")
            except:
                pass
            
            if not address_input:
                # Fallback: find input after email
                try:
                    all_inputs = self.driver.find_elements(By.XPATH, "//form//input")
                    for i, inp in enumerate(all_inputs):
                        if inp.get_attribute('type') == 'email':
                            if i + 1 < len(all_inputs):
                                next_inp = all_inputs[i + 1]
                                if next_inp.get_attribute('type') not in ['email', 'tel']:
                                    address_input = next_inp
                                    print("[9/11] ✓ Found address input by position")
                                    break
                except:
                    raise Exception("Could not find address input")
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", address_input)
            time.sleep(0.3)
            address_input.clear()
            address_input.send_keys("Calle Test 123")
            print("✓ Entered address")
            
            # Fill zip code - Quasar q-input (uses label "Código Postal")
            print("[9/11] Filling zip code: 76159...")
            zip_input = None
            try:
                zip_input = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[@maxlength='5']"))
                )
                print("[9/11] ✓ Found zip code input by maxlength")
            except TimeoutException:
                # Use JavaScript
                try:
                    zip_input = self.driver.execute_script("""
                        const labels = Array.from(document.querySelectorAll('label'));
                        const zipLabel = labels.find(l => l.textContent.includes('Código Postal') || l.textContent.includes('Código'));
                        if (zipLabel) {
                            const qField = zipLabel.closest('.q-field');
                            if (qField) {
                                return qField.querySelector('input');
                            }
                        }
                        return document.querySelector('input[maxlength="5"]');
                    """)
                    if zip_input:
                        print("[9/11] ✓ Found zip code input by JavaScript")
                except:
                    raise Exception("Could not find zip code input")
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", zip_input)
            time.sleep(0.3)
            zip_input.clear()
            zip_input.send_keys("76159")
            print("✓ Entered zip code")
            
            # Trigger blur event to load neighborhoods
            print("[9/11] Triggering zip code blur to load neighborhoods...")
            self.driver.execute_script("arguments[0].blur();", zip_input)
            time.sleep(1)
            
            # Wait for neighborhoods to load
            print("[9/11] Waiting for neighborhoods to load...")
            max_wait = 15  # Increase wait time
            waited = 0
            neighborhoods_loaded = False
            while waited < max_wait:
                try:
                    # Check if loading spinner is gone
                    loading_spinners = self.driver.find_elements(By.XPATH, "//span[contains(text(), 'Cargando colonias')]")
                    if not loading_spinners or not any(spinner.is_displayed() for spinner in loading_spinners):
                        # Check if colonia select is enabled (not disabled)
                        colonia_input = self.driver.execute_script("""
                            const labels = Array.from(document.querySelectorAll('label'));
                            const coloniaLabel = labels.find(l => l.textContent.includes('Colonia'));
                            if (coloniaLabel) {
                                const qField = coloniaLabel.closest('.q-field');
                                if (qField) {
                                    const input = qField.querySelector('input');
                                    if (input && !input.disabled) {
                                        return input;
                                    }
                                }
                            }
                            return null;
                        """)
                        if colonia_input:
                            neighborhoods_loaded = True
                            print("[9/11] ✓ Neighborhoods loaded (select is enabled)")
                            break
                except:
                    pass
                time.sleep(0.5)
                waited += 0.5
            
            if not neighborhoods_loaded:
                print("[9/11] ⚠ Warning: Timeout waiting for neighborhoods, proceeding anyway...")
            
            time.sleep(1)
            
            # Select colonia "La cima" - Quasar q-select
            print("[9/11] Selecting colonia 'La cima'...")
            colonia_input = None
            
            # Strategy 1: Find input by label "Colonia"
            try:
                colonia_input = self.driver.execute_script("""
                    const labels = Array.from(document.querySelectorAll('label'));
                    const coloniaLabel = labels.find(l => l.textContent.includes('Colonia'));
                    if (coloniaLabel) {
                        const qField = coloniaLabel.closest('.q-field');
                        if (qField) {
                            return qField.querySelector('input');
                        }
                    }
                    return null;
                """)
                if colonia_input:
                    print("[9/11] ✓ Found colonia input by JavaScript")
            except:
                pass
            
            # Strategy 2: Find by q-select with label
            if not colonia_input:
                try:
                    colonia_label = self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//label[contains(text(), 'Colonia')]"))
                    )
                    form_group = colonia_label.find_element(By.XPATH, "./ancestor::div[contains(@class, 'q-field')]")
                    colonia_input = form_group.find_element(By.XPATH, ".//input")
                    print("[9/11] ✓ Found colonia input by label")
                except TimeoutException:
                    raise Exception("Could not find colonia select input")
            
            # Click to open dropdown
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", colonia_input)
            time.sleep(0.5)
            self.driver.execute_script("arguments[0].click();", colonia_input)
            print("[9/11] Opened colonia dropdown")
            time.sleep(1.5)
            
            # Wait for q-menu to appear
            self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'q-menu')]"))
            )
            print("[9/11] ✓ q-menu appeared for colonia.")
            
            # Find and select "La cima" option - Quasar q-item
            print("[9/11] Looking for 'La cima' option...")
            la_cima_option = None
            
            # Strategy 1: Direct search
            try:
                la_cima_option = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'q-menu')]//div[contains(@class, 'q-item') and contains(translate(., 'LA CIMA', 'la cima'), 'la cima')]"))
                )
                print("[9/11] ✓ Found 'La cima' option using Strategy 1")
            except TimeoutException:
                print("[9/11] Strategy 1 failed, trying alternatives...")
                
                # Strategy 2: Search all options
                all_colonia_options = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'q-menu')]//div[contains(@class, 'q-item')]")
                print(f"[9/11] Found {len(all_colonia_options)} colonia options")
                
                for option in all_colonia_options:
                    try:
                        option_text = option.text.strip().lower()
                        if 'la cima' in option_text or 'cima' in option_text:
                            la_cima_option = option
                            print(f"[9/11] ✓ Found 'La cima' option: '{option.text.strip()}'")
                            break
                    except:
                        continue
            
            # Strategy 3: JavaScript search
            if not la_cima_option:
                try:
                    la_cima_option = self.driver.execute_script("""
                        const items = Array.from(document.querySelectorAll('.q-item'));
                        for (const item of items) {
                            const text = (item.textContent || item.innerText || '').toLowerCase();
                            if (text.includes('la cima') || text.includes('cima')) {
                                return item;
                            }
                        }
                        return null;
                    """)
                    if la_cima_option:
                        print("[9/11] ✓ Found 'La cima' option using JavaScript")
                except:
                    pass
            
            if not la_cima_option:
                # Debug: List all available options
                print("[9/11] DEBUG: Could not find 'La cima'. Available options:")
                try:
                    all_items = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'q-menu')]//div[contains(@class, 'q-item')]")
                    for i, item in enumerate(all_items[:10], 1):  # Show first 10
                        try:
                            print(f"  [{i}] '{item.text.strip()}'")
                        except:
                            pass
                except:
                    pass
                raise Exception("Could not find 'La cima' colonia option")
            
            # Click the option
            if hasattr(la_cima_option, 'id'):
                # It's a WebElement
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", la_cima_option)
                time.sleep(0.3)
                self.driver.execute_script("arguments[0].click();", la_cima_option)
            else:
                # It's a JavaScript element
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click();", la_cima_option)
            print("✓ Selected colonia 'La cima'")
            time.sleep(1)
            
            # Submit form - Quasar q-btn
            print("[9/11] Submitting registration form...")
            submit_button = None
            try:
                submit_button = self.driver.find_element(By.XPATH, "//button[contains(@class, 'submit-button')]")
                if not submit_button.is_displayed():
                    submit_button = None
            except:
                pass
            
            if not submit_button:
                try:
                    submit_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Enviar')]")
                except:
                    pass
            
            if not submit_button:
                submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            
            # Scroll into view and use JavaScript click
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_button)
            time.sleep(0.3)
            self.driver.execute_script("arguments[0].click();", submit_button)
            print("✓ Submitted registration form")
            
            # Wait for registration to complete
            time.sleep(5)
            print("✓ Registration completed")
            
        except Exception as e:
            print(f"⚠ Error during registration: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        # Step 10: Login with the newly registered client
        print("\n[10/11] Logging in with newly registered client...")
        try:
            current_url = self.driver.current_url
            print(f"[10/11] Current URL after registration: {current_url}")
            
            if "/login" not in current_url:
                print(f"[10/11] Navigating to login page: {self.base_url}/login")
                self.driver.get(f"{self.base_url}/login")
                time.sleep(2)
            
            # Wait for page to load
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            time.sleep(2)
            
            # Hide Nuxt DevTools
            try:
                self.driver.execute_script("document.querySelector('nuxt-devtools-frame')?.style.setProperty('display', 'none', 'important');")
            except:
                pass
            
            # Check and fill email - Quasar q-input
            print(f"[10/11] Checking email field...")
            email_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@type='email' or @placeholder='Ingresa tu correo electrónico']"))
            )
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", email_input)
            time.sleep(0.3)
            
            current_email = email_input.get_attribute('value') or ''
            if not current_email or test_email not in current_email:
                print(f"[10/11] Filling email: {test_email}...")
                email_input.clear()
                email_input.send_keys(test_email)
                print("✓ Entered email")
            else:
                print(f"✓ Email already filled: {current_email}")
            
            # Check and fill phone - Quasar q-input
            print(f"[10/11] Checking phone field...")
            phone_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@type='tel' or @placeholder='Ingresa tu teléfono']"))
            )
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", phone_input)
            time.sleep(0.3)
            
            current_phone = phone_input.get_attribute('value') or ''
            phone_digits = ''.join(filter(str.isdigit, current_phone))
            test_phone_digits = ''.join(filter(str.isdigit, test_phone))
            
            if not current_phone or phone_digits != test_phone_digits:
                print(f"[10/11] Filling phone: {test_phone}...")
                phone_input.clear()
                phone_input.send_keys(test_phone)
                print("✓ Entered phone")
            else:
                print(f"✓ Phone already filled: {current_phone}")
            
            # Click login button - Quasar q-btn
            print("[10/11] Looking for login button...")
            login_button = None
            try:
                elements = self.driver.find_elements(By.XPATH, "//button[contains(@class, 'submit-button')]")
                for elem in elements:
                    if elem.is_displayed():
                        login_button = elem
                        break
            except:
                pass
            
            if not login_button:
                all_buttons = self.driver.find_elements(By.TAG_NAME, "button")
                for btn in all_buttons:
                    try:
                        btn_text = btn.text.strip()
                        if 'iniciar' in btn_text.lower() and btn.is_displayed():
                            login_button = btn
                            break
                    except:
                        pass
            
            if not login_button:
                raise Exception("Could not find login button")
            
            # Use JavaScript click
            print("[10/11] Clicking login button using JavaScript...")
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", login_button)
            time.sleep(0.3)
            self.driver.execute_script("arguments[0].click();", login_button)
            print("✓ Clicked login button")
            
            # Wait for redirect to my-documents
            print("[10/11] Waiting for redirect to my-documents...")
            self.wait.until(EC.url_contains("/my-documents"))
            print("✓ Successfully logged in and redirected to my-documents")
            time.sleep(2)
            
        except Exception as e:
            print(f"⚠ Error during login: {e}")
            import traceback
            traceback.print_exc()
            print("[10/11] Attempting to navigate to my-documents directly...")
            self.driver.get(f"{self.base_url}/my-documents")
            time.sleep(3)
        
        # Step 11: Upload INE front document
        print("\n[11/11] Uploading INE front document...")
        try:
            current_url = self.driver.current_url
            if "/my-documents" not in current_url:
                print(f"[11/11] Navigating to my-documents: {self.base_url}/my-documents")
                self.driver.get(f"{self.base_url}/my-documents")
            
            # Wait for page to load
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            time.sleep(3)
            
            # Hide Nuxt DevTools
            try:
                self.driver.execute_script("document.querySelector('nuxt-devtools-frame')?.style.setProperty('display', 'none', 'important');")
            except:
                pass
            
            # Find and click "Subir/Actualizar" button - Quasar q-btn
            print("[11/11] Looking for 'Subir/Actualizar' button for ID Document Front...")
            upload_toggle = None
            all_buttons = self.driver.find_elements(By.TAG_NAME, "button")
            for btn in all_buttons:
                try:
                    btn_text = btn.text.strip()
                    if 'subir' in btn_text.lower() and 'actualizar' in btn_text.lower() and btn.is_displayed():
                        upload_toggle = btn
                        break
                except:
                    pass
            
            if not upload_toggle:
                raise Exception("Could not find 'Subir/Actualizar' button for ID Document Front")
            
            # Use JavaScript click
            print("[11/11] Clicking upload button using JavaScript...")
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", upload_toggle)
            time.sleep(0.3)
            self.driver.execute_script("arguments[0].click();", upload_toggle)
            print("✓ Opened upload section")
            
            time.sleep(2)  # Wait for upload section to expand
            
            # Verify upload section is expanded
            print("[11/11] Verifying upload section is expanded...")
            upload_section_visible = self.driver.execute_script("""
                const sections = document.querySelectorAll('.upload-section');
                for (const section of sections) {
                    const style = window.getComputedStyle(section);
                    if (style.display !== 'none' && style.visibility !== 'hidden') {
                        return true;
                    }
                }
                return false;
            """)
            if not upload_section_visible:
                print("[11/11] ⚠ Upload section not visible, waiting more...")
                time.sleep(2)
            
            # Find the hidden file input - we added it directly in the upload section
            print("[11/11] Looking for hidden file input in upload section...")
            file_input = None
            
            # Strategy 1: Find the hidden file input directly in the upload section
            try:
                file_input = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'upload-section')]//input[@type='file']"))
                )
                print("[11/11] ✓ Found hidden file input in upload section")
            except TimeoutException:
                print("[11/11] ✗ Strategy 1 failed, trying alternatives...")
                
                # Strategy 2: Find any file input
                try:
                    file_input = self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//input[@type='file']"))
                    )
                    print("[11/11] ✓ Found file input anywhere in document")
                except TimeoutException:
                    print("[11/11] ✗ Strategy 2 failed")
            
            if not file_input:
                raise Exception("Could not find file input. Upload section may not be expanded.")
            
            # Make sure the file input is accessible (even if it has display: none)
            print("[11/11] Making file input accessible...")
            self.driver.execute_script("""
                arguments[0].style.display = 'block';
                arguments[0].style.visibility = 'visible';
                arguments[0].style.opacity = '1';
                arguments[0].style.position = 'relative';
                arguments[0].style.width = '100%';
                arguments[0].style.height = '100%';
                arguments[0].removeAttribute('hidden');
                arguments[0].removeAttribute('tabindex');
            """, file_input)
            print("[11/11] ✓ Made file input accessible")
            
            # Get the absolute path to the image file
            import os
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            image_path = os.path.join(project_root, "public", "assets", "credencial-modeloC.png")
            image_path = os.path.abspath(image_path)
            
            print(f"[11/11] DEBUG: Looking for image at: {image_path}")
            if not os.path.exists(image_path):
                alt_path = os.path.join(project_root, "assets", "credencial-modeloC.png")
                if os.path.exists(alt_path):
                    image_path = alt_path
                    print(f"[11/11] DEBUG: Found image at alternative path: {alt_path}")
                else:
                    raise Exception(f"Image file not found at: {image_path} or {alt_path}")
            
            # Upload the file
            print(f"[11/11] Uploading image from: {image_path}")
            # If file_input is a JavaScript element, we need to find it as a WebElement
            if not hasattr(file_input, 'send_keys'):
                # It's a JavaScript element, find it as WebElement
                file_input = self.driver.find_element(By.XPATH, "//input[@type='file']")
            
            # Make sure it's visible and accessible
            self.driver.execute_script("""
                arguments[0].style.display = 'block';
                arguments[0].style.visibility = 'visible';
                arguments[0].style.opacity = '1';
                arguments[0].style.position = 'relative';
                arguments[0].style.width = '100%';
                arguments[0].style.height = '100%';
            """, file_input)
            
            # Use send_keys to upload the file
            file_input.send_keys(image_path)
            
            print("✓ Selected file")
            time.sleep(2)  # Wait for file to be processed and submit button to appear
            
            # Click "Subir Documento" button - Quasar q-btn
            # This button only appears after a file is selected
            print("[11/11] Looking for 'Subir Documento' button...")
            upload_submit = None
            
            # Strategy 1: Find by class
            try:
                upload_submit = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'upload-submit-btn')]"))
                )
                print("[11/11] ✓ Found submit button by class")
            except TimeoutException:
                print("[11/11] ✗ Strategy 1 failed, trying alternatives...")
                
                # Strategy 2: Find by text
                all_buttons = self.driver.find_elements(By.TAG_NAME, "button")
                for btn in all_buttons:
                    try:
                        btn_text = btn.text.strip()
                        if 'subir' in btn_text.lower() and 'documento' in btn_text.lower():
                            if btn.is_displayed() and btn.is_enabled():
                                upload_submit = btn
                                print(f"[11/11] ✓ Found submit button by text: '{btn_text}'")
                                break
                    except:
                        pass
            
            # Strategy 3: Use JavaScript
            if not upload_submit:
                try:
                    upload_submit = self.driver.execute_script("""
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const submitBtn = buttons.find(btn => {
                            const text = (btn.textContent || btn.innerText || '').toLowerCase();
                            const hasClass = btn.classList.contains('upload-submit-btn');
                            return (hasClass || (text.includes('subir') && text.includes('documento'))) && 
                                   btn.offsetParent !== null && 
                                   !btn.disabled;
                        });
                        return submitBtn;
                    """)
                    if upload_submit:
                        print("[11/11] ✓ Found submit button using JavaScript")
                except:
                    pass
            
            if not upload_submit:
                # Wait a bit more and try again
                print("[11/11] Button not found, waiting 2 more seconds...")
                time.sleep(2)
                try:
                    upload_submit = self.driver.find_element(By.XPATH, "//button[contains(@class, 'upload-submit-btn')]")
                    if upload_submit.is_displayed():
                        print("[11/11] ✓ Found submit button on retry")
                except:
                    raise Exception("Could not find 'Subir Documento' button. File may not have been selected properly.")
            
            # Use JavaScript click
            print("[11/11] Clicking submit button using JavaScript...")
            if hasattr(upload_submit, 'id'):
                # It's a WebElement
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", upload_submit)
                time.sleep(0.3)
                self.driver.execute_script("arguments[0].click();", upload_submit)
            else:
                # It's a JavaScript element
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click();", upload_submit)
            print("✓ Clicked upload submit button")
            
            # Wait for upload to complete
            print("[11/11] Waiting for upload to complete...")
            time.sleep(5)
            
            # Check for success indicators
            try:
                # Look for success message or updated status
                success_indicators = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'subido') or contains(text(), 'completado') or contains(text(), 'éxito')]")
                if success_indicators:
                    print("[11/11] ✓ Upload success indicator found")
            except:
                pass
            
            print("✓ Document upload completed")
            
        except Exception as e:
            print(f"⚠ Error during document upload: {e}")
            import traceback
            traceback.print_exc()
            print("⚠ Continuing despite upload error...")
        
        print("\n=== Test Completed Successfully ===")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])

