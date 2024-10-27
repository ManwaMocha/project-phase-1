const init = () => {
    const tableBody = document.getElementById('tableBody');
    const entryList = document.getElementById('entryList');

    // Fetch data from CoinGecko API
    const fetchCryptocurrencies = () => {
        fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false")
            .then(response => response.json())
            .then(data => renderCurrencies(data))
            .catch(error => console.error('Error fetching data:', error));
    };

    // Function to render currencies to the DOM
    const renderCurrencies = (currencies) => {
        currencies.forEach(crypto => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            nameCell.textContent = crypto.name;
            row.appendChild(nameCell);

            const symbolCell = document.createElement('td');
            symbolCell.textContent = crypto.symbol.toUpperCase();
            row.appendChild(symbolCell);

            const priceCell = document.createElement('td');
            priceCell.textContent = parseFloat(crypto.current_price).toFixed(2);
            row.appendChild(priceCell);

            const priceChangeCell = document.createElement('td');
            priceChangeCell.textContent = `${parseFloat(crypto.price_change_percentage_24h).toFixed(2)}%`;
            row.appendChild(priceChangeCell);

            const volumeCell = document.createElement('td');
            volumeCell.textContent = crypto.total_volume;
            row.appendChild(volumeCell);

            tableBody.appendChild(row);
        });
    };

    // Function to fetch saved trades from db.json
    const fetchSavedTrades = () => {
        fetch('http://localhost:3000/trades')
            .then(response => response.json())
            .then(data => {
                data.forEach(trade => addEntryToDOM(trade));
            })
            .catch(error => console.error('Error fetching saved trades:', error));
    };

    // Function to add entry to the DOM
    const addEntryToDOM = (tradeData) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${tradeData.tradeDate} - ${tradeData.cryptoCurrency} - ${tradeData.tradeType} - ${tradeData.notes}`;
        entryList.appendChild(listItem);
    };

    // Handle form submission
    document.getElementById('tradingJournal').addEventListener('submit', function(e) {
        e.preventDefault();
        const tradeData = {
            tradeDate: document.getElementById('tradeDate').value,
            cryptoCurrency: document.getElementById('cryptoCurrency').value,
            tradeType: document.getElementById('tradeType').value,
            notes: document.getElementById('notes').value
        };
        postRequest(tradeData);
    });

    // Function to send a POST request to db.json
    const postRequest = (tradeData) => {
        fetch('http://localhost:3000/trades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tradeData)
        })
        .then(res => res.json())
        .then(data => {
            console.log('Success:', data);
            addEntryToDOM(tradeData);
            document.getElementById('tradingJournal').reset();
        })
        .catch(error => console.error('Error:', error));
    };

    // Handle the Clear Entries button
    document.getElementById('clear').addEventListener('click', (e) => {
        e.preventDefault();

        fetch('http://localhost:3000/trades')
            .then(response => response.json())
            .then(trades => {
                const deletePromises = trades.map(trade => 
                    fetch(`http://localhost:3000/trades/${trade.id}`, { method: 'DELETE' })
                );
                return Promise.all(deletePromises);
            })
            .then(() => {
                console.log('All entries cleared');
                entryList.innerHTML = ''; // Clear displayed entries in the DOM
            })
            .catch(error => console.error('Error clearing entries:', error));
    });

    // Select all elements with the class 'divisions' and add mouse events
    const addMouseEventsToDivisions = () => {
        const divisions = document.querySelectorAll('.divisions');
        divisions.forEach(div => {
            div.addEventListener('mouseenter', () => {
                div.style.backgroundColor = '#347474'; // Change background color
            });
            div.addEventListener('mouseleave', () => {
                div.style.backgroundColor = ''; // Reset background color
            });
        });
    };

    // Fetch saved trades and cryptocurrencies on initialization
    fetchCryptocurrencies();
    fetchSavedTrades();
    addMouseEventsToDivisions();
};

document.addEventListener('DOMContentLoaded', init);
