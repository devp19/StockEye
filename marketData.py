import requests 
from bs4 import BeautifulSoup
import sys
from fake_useragent import UserAgent

ua = UserAgent(min_percentage=5.0)
fake = str(ua.random)

#print(fake)

def getData(symbol):
    headers = { 'User-Agent': fake}
    url = f'https://seekingalpha.com/symbol/{symbol}'


    r = requests.get(url, headers=headers) 
    soup = BeautifulSoup(r.text, 'html.parser')

    
    stock = {

        'Company' : soup.find('span', {'data-test-id': 'symbol-full-name'}).text,
        'Price'  : soup.find('span', {'data-test-id': 'symbol-price'}).text,
        'Change'  : soup.find('span', {'data-test-id': 'symbol-change'}).text,
        #'Information': soup.find('div', {'data-test-id': 'company-profile-info'}).text\
            #if soup.find('div', {'data-test-id': 'company-profile-info'}) else "No information available"
    }
    return stock
    

# symbol = input('ticker: ')

# print(getData(symbol))

print(getData(str(sys.argv[1])))
