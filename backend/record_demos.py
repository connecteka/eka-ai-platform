"""
Script to record demo videos of the EKA-AI app features using Playwright
"""
import asyncio
from playwright.async_api import async_playwright
import os

BASE_URL = "https://eka-detail-page.preview.emergentagent.com"
OUTPUT_DIR = "/app/frontend/public/videos"

async def record_pdi_demo():
    """Record PDI Process demo"""
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=OUTPUT_DIR,
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()
        
        try:
            # Navigate to PDI page
            await page.goto(f"{BASE_URL}/app/pdi")
            await page.wait_for_load_state('networkidle')
            await asyncio.sleep(2)
            
            # Click on PDI Checklist card
            pdi_card = page.locator('text=PDI Checklist').first
            if await pdi_card.is_visible():
                await pdi_card.click()
                await asyncio.sleep(1)
            
            # Interact with the modal if it opens
            await asyncio.sleep(3)
            
            print("PDI demo recorded successfully")
        except Exception as e:
            print(f"PDI demo error: {e}")
        finally:
            await context.close()
            await browser.close()
        
        # Rename the video file
        for f in os.listdir(OUTPUT_DIR):
            if f.endswith('.webm') and 'pdi' not in f.lower():
                os.rename(
                    os.path.join(OUTPUT_DIR, f),
                    os.path.join(OUTPUT_DIR, "pdi-demo.webm")
                )
                break

async def record_jobcard_demo():
    """Record Job Card demo"""
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=OUTPUT_DIR,
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()
        
        try:
            # Navigate to Job Cards page
            await page.goto(f"{BASE_URL}/app/job-cards")
            await page.wait_for_load_state('networkidle')
            await asyncio.sleep(2)
            
            # Show the job cards list
            await asyncio.sleep(2)
            
            # Try clicking New Job Card if visible
            new_btn = page.locator('text=New Job Card').first
            if await new_btn.is_visible():
                await new_btn.click()
                await asyncio.sleep(2)
            
            await asyncio.sleep(2)
            print("Job Card demo recorded successfully")
        except Exception as e:
            print(f"Job Card demo error: {e}")
        finally:
            await context.close()
            await browser.close()

async def record_chat_demo():
    """Record AI Chat demo"""
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=OUTPUT_DIR,
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()
        
        try:
            # Navigate to Chat page
            await page.goto(f"{BASE_URL}/claude-chat")
            await page.wait_for_load_state('networkidle')
            await asyncio.sleep(2)
            
            # Type a message
            input_field = page.locator('textarea, input[type="text"]').first
            if await input_field.is_visible():
                await input_field.fill("What are common engine warning light causes?")
                await asyncio.sleep(1)
            
            await asyncio.sleep(3)
            print("Chat demo recorded successfully")
        except Exception as e:
            print(f"Chat demo error: {e}")
        finally:
            await context.close()
            await browser.close()

async def record_dashboard_demo():
    """Record Dashboard demo"""
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=OUTPUT_DIR,
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()
        
        try:
            # Navigate to Dashboard
            await page.goto(f"{BASE_URL}/app/dashboard")
            await page.wait_for_load_state('networkidle')
            await asyncio.sleep(3)
            
            # Scroll down to show more content
            await page.mouse.wheel(0, 300)
            await asyncio.sleep(2)
            
            print("Dashboard demo recorded successfully")
        except Exception as e:
            print(f"Dashboard demo error: {e}")
        finally:
            await context.close()
            await browser.close()

async def main():
    """Record all demos"""
    print("Starting demo recordings...")
    
    await record_dashboard_demo()
    await record_jobcard_demo()
    await record_pdi_demo()
    await record_chat_demo()
    
    print(f"\nAll demos recorded to {OUTPUT_DIR}")
    print("Files created:")
    for f in os.listdir(OUTPUT_DIR):
        print(f"  - {f}")

if __name__ == "__main__":
    asyncio.run(main())
