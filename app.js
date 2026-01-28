let calls=[], replyList=[], selected=null;
let stockList = [];
let expiryList = [];


callDate.value = new Date().toISOString().split("T")[0];
cfDate.value = new Date().toISOString().split("T")[0];

function loadExpiryJson(){
  
fetch('./data/ExpiryList.json')
  .then(response => response.json())
  .then(json => {    
    expiryList = json.indexExpiry;
        
  })
  .catch(error => console.error('Error:', error));
}


function loadScriptsJson() {
  /* ---------- Load Stock List ---------- */
  let stockData = [];
  
fetch("./data/StockLists.json")
  .then(res => res.json())
  .then(data => {
    stockList = data.stockData.map(item => {
                // Return a new object with only the required properties
                return {
                  value: item.value,
                  lotsize: item.lotsize
                }; // IMPORTANT
            });
            })
  .catch(err => console.error("StockList load error", err));

  /* ---------- Autocomplete --------- */
  const input = document.getElementById("script");
  const box = document.getElementById("autocompleteBox");
  let index = -1;


  input.addEventListener("input", () => {
    const val = input.value.toLowerCase();
    box.innerHTML = "";
    index = -1;

    if (!val) return box.style.display = "none";

    const matches = stockList.filter(s => s.value.toLowerCase().startsWith(val));
    if (!matches.length) return box.style.display = "none";

    matches.forEach((s, i) => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";
      div.innerHTML = "<strong>" + s.value.substr(0,val.length) + "</strong>" + s.value.substr(val.length);
      div.onclick = () => { input.value = s.value; box.style.display = "none"; };
      box.appendChild(div);
    });

    box.style.display = "block";
  });

  input.addEventListener("keydown", e => {
    const items = box.querySelectorAll(".autocomplete-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") { index = (index + 1) % items.length; }
    if (e.key === "ArrowUp") { index = (index - 1 + items.length) % items.length; }
    if (e.key === "Escape") { ResetInputs();    input.value = "";  }
    if (e.key === "Enter") {
      e.preventDefault();
      if (index >= 0) items[index].click();

      /* Dont Update Expiries for Forex or non-Index Symbols */
      let selName = items[index].innerHTML;
      if(chkForexSymbol(selName) === false){     
        if(chkIndexSymbol(selName) === false){         ResetInputs();     updateExpiries();   }      }
    }

    items.forEach(i => i.classList.remove("active"));
    if (index >= 0) items[index].classList.add("active");
  });

  document.addEventListener("click", e => {
  
    if (!input.contains(e.target)) {  
        
        /* Dont Update Expiries for Foex Symbols */
        let selName = input.value;
        if(chkForexSymbol(selName) === false){     
            if(chkIndexSymbol(selName) === false){      ResetInputs();     updateExpiries();   }
        }

        box.style.display = "none";   //updateExpiries();   
        }
  });
  
}

function chkIndexSymbol(txtSymbol)
{
    let text = txtSymbol; 
    const selectedSymbol = text.replace(/<\/?[^>]+(>|$)/g, "");

    const expirySelect = document.getElementById('wklyexpiry');
    const strikeInput = document.getElementById('strike');
    
    const indexValues = ["Nifty", "Sensex"];

    /*For non-Index Symbols No Expiry Selection & StrikePrice */
    if(!indexValues.includes(selectedSymbol.trim())) {   
                
        //Blank if any previous values
        expirySelect.innerHTML = "";

        // Set the disabled property
        expirySelect.disabled = true;

        return true;
    };

    return false;
}

function chkForexSymbol(txtSymbol)
{
    let text = txtSymbol; 
    const selectedSymbol = text.replace(/<\/?[^>]+(>|$)/g, "");

    const expirySelect = document.getElementById('wklyexpiry');
    const strikeInput = document.getElementById('strike');
    
    const forexValues = ["XAUUSD", "BTCUSD"];

    /*For Forex Symbols No Expiry Selection & StrikePrice */
    if(forexValues.includes(selectedSymbol.trim())) {   
                
        //Blank if any previous values
        expirySelect.innerHTML = "";
        strikeInput.value="";

        // Set the disabled property
        expirySelect.disabled = true;
        strikeInput.disabled = true; 

        return true;
    };

    return false;
}

function formatDate(timestamp) {
  const dateObj = new Date(timestamp);

  // Get day, month, and year components
  let day = dateObj.getDate();
  let month = dateObj.getMonth() + 1; // Month is 0-indexed, so add 1
  let year = dateObj.getFullYear();

  // Pad day and month with a leading zero if they are single digits
  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;

  // Assemble the date string in "dd-MM-yyyy" format
  return `${day}-${month}-${year}`;
}

function formatDateTime(timestamp,isexpiry) {
    // Create a new Date object from the numeric timestamp
    const dateObj = new Date(timestamp);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   //console.log(timestamp);
    // Get individual components
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = months[dateObj.getMonth()]; // getMonth() is 0-indexed (Jan is 0)
    //const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    if(isexpiry === true) {   return `${day} ${month}`;   }

    // Assemble the parts into the desired format
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Helper to convert "dd/mm/yyyy" to a Date object
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day); // Month is 0-indexed
}

function fromDDMM_MMDD_DateFormat(datestr){
  const original = datestr; //'13/01/2026';
  const [day, month, year] = original.split('/');
  const mdy = `${month}/${day}/${year}`;

  return mdy;
}

/* For Date Format like "5th Jan 2026" */
function HeadingDateFormat(hdgDate){

    const headgDate = new Date(hdgDate);
    const day = headgDate.getDate();
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
    const monthYear = formatter.format(headgDate); // "Jan 2026"

    const ordinalDay = day + (['st','nd','rd'][((day+90)%100-10)%10-1] || 'th');
    //console.log(`${ordinalDay} ${monthYear}`); // "5th Jan 2026"

    return `${ordinalDay} ${monthYear}`;
}

function updateExpiries() {
    const symbolSelect = document.getElementById('script');    
    const expirySelect = document.getElementById('wklyexpiry');
    //const strikeInput = document.getElementById('strike');

    const selectedSymbol = symbolSelect.value;
    
    // Clear previous options
    expirySelect.innerHTML = '<option value="">-- Choose Expiry --</option>';
    
    if (!selectedSymbol) return;

    // Get today's date (at midnight for accurate comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter by symbol AND date >= today
    const filteredExpiries = expiryList.filter(item => {
        const itemDate = parseDate(item.expiry);
        return item.value === selectedSymbol && itemDate >= today;
    });

    // Sort to ensure chronological order (optional but recommended)
    filteredExpiries.sort((a, b) => parseDate(a.expiry) - parseDate(b.expiry));

    // Fill the select input
    filteredExpiries.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = item.expiry;
        option.textContent = item.expiry;
        expirySelect.appendChild(option);
    });

    //console.log("Expiries - ",filteredExpiries);
    // Automatically select the 1st valid expiry if available
    if (filteredExpiries.length > 0) {
        expirySelect.selectedIndex = 1; // 0 is the placeholder
    }
}


callForm.onsubmit=e=>{
e.preventDefault();

let f=+from.value,t=+to.value;


//if(!(f<t&&slv<f&&t1v>t&&t2v>t1v&&t3v>t2v)) return alert("Validation failed");

//calls.push({id:Date.now(),script:script.value,from:f,to:t,t1:t1v,t2:t2v,t3:t3v,status:"Inactive"});
const symbolname = callForm.script.value;
const lsz = stockList.find(s => s.value === symbolname)?.lotsize;

const indexValues = ["Nifty","Sensex"];
const forexValues = ["XAUUSD", "BTCUSD"];

const cexpiry = (indexValues.includes(symbolname.trim())) ? callForm.wklyexpiry.value : callForm.expirytype.value;
//const callexpiry = new Date(cexpiry.split('/').reverse().join('-')); // "2026-01-13"
const callexpiry = new Date(fromDDMM_MMDD_DateFormat(cexpiry));
if(callexpiry === "Invalid Date")
{
    callexpiry = cexpiry;
}


const callObj = {
        id: Date.now(),
        date: callForm.callDate.value,
        cfdate: callForm.cfDate.value,  //cfDate means CarryForward Date of the Call which was given on a previous Date
        tradetype: callForm.tradetype.value,
        script: callForm.script.value,
        expiry: callexpiry,
        strike: callForm.strike.value,
        option: callForm.optiontype.value,
        from: f,      
        to: t,     
        lotSize: lsz,
        tg_msgid: null   // Telegram message id of NEW CALL
    };

    calls.push(callObj);



/* If Current Symbol is a Forex Symbol then Reset the Inputs to "Enable" */
if(forexValues.includes(symbolname.trim())){     ResetInputs();    }

callForm.reset();
callDate.value = new Date().toISOString().split("T")[0];
cfDate.value = new Date().toISOString().split("T")[0];

// Clear the expiry dropdown
const expirySelect = document.getElementById('wklyexpiry');
expirySelect.options.length = 0; // Keep only "-- Choose Expiry --"


};

function ResetInputs()
{
    const expirySelect = document.getElementById('wklyexpiry');
    const strikeInput = document.getElementById('strike');

    //console.log("called");
    expirySelect.disabled = false;
    strikeInput.disabled = false;    
}

function showMsg()
{
  let reportMessage = "";
  reportMessage = generateReportShow(calls);
  //reportMessage = generateReportCopy(calls); //generateReportShow(calls);
  editableMessage.innerHTML = reportMessage;

  msgModal.style.display='flex';
}

function generateReportShow(trades) {
    //const selMarket = getRadioValue("markettype");  // FOREX / INDIAN;
    let totalPips = 0;
    let totalProfit01 = 0;
    let totalProfit1 = 0;
    let reportBody = ""; 
    //console.log(trades);

    const forexSymbols = ["XAUUSD", "BTCUSD"];

    //const mktType = document.querySelector('input[name="optiontype"]:checked')?.value || "";

    //console.log(trades);
    const marketTrades = trades.filter(trade => {
      const isForexSymbol = forexSymbols.includes(trade.script);

      if (reportIndianMarket === false) {
        // Only include if it's one of the two forex symbols
        return isForexSymbol;
      } else {
        // Indian market: include everything EXCEPT those two symbols
        return !isForexSymbol;
      }
    });


    if (reportIndianMarket === false) 
    {
      reportBody = `<b>Trades Summary - ${HeadingDateFormat(new Date())}</b><br><br>`;

      marketTrades.forEach((trade, index) => {

          let pips = 0;
          let profit01 = 0;
          let profit1 = 0;
          
          const isBuy = trade.tradetype.toLowerCase() === "buy";
          const diff = isBuy ? (trade.to - trade.from) : (trade.from - trade.to);

          if (trade.script === "XAUUSD") {
              // Gold: 1 pip = 0.01 move. 100 pips = $1 move.
              pips = diff * 100; 
              profit1 = diff * 100; // $100 per $1 move for 1 lot
              profit01 = diff * 10;  // $10 per $1 move for 0.1 lot
          } else if (trade.script.includes("BTCUSD")) {
              // Crypto: Generally 1 point move = 1 pip
              pips = diff;
              profit1 = diff * 1; 
              profit01 = diff * 0.1;
          } else {
              // Forex: 1 pip = 0.0001 move
              pips = diff * 10000;
              profit1 = pips * 10;
              profit01 = pips * 1;
          }

          totalPips += pips;
          totalProfit01 += profit01;
          totalProfit1 += profit1;

          const suffix = (index + 1 === 1) ? "st" : (index + 1 === 2) ? "nd" : (index + 1 === 3) ? "rd" : "th";

          reportBody += ` <b>${toEmojiNumber(index + 1)} Trade</b><br>`;
          reportBody += ` <b>${trade.tradetype} ${trade.script} ${trade.from} ➝ ${trade.to}</b><br>`;
          /*reportBody += `📌 <b>Total Pips: ${pips}</b><br>`;*/
          reportBody += `💵 <b>Profit(0.10 Lot): $${profit01} 💵</b><br>`;
          reportBody += `💰 <b>Profit(1 Lot): $${profit1} 💵<br></b><br>`;
      });


      reportBody += `➡️➡️ <b>Final Result (Day Summary)</b><br>`;
      reportBody += `➡️➡️ <b>Total Pips: ${totalPips}</b><br>`;
      reportBody += `💲 <b>Profit for 0.10 Lot: $${totalProfit01}</b>💲<br>`;
      reportBody += `💲 <b>Profit for 1 Lot: $${totalProfit1}</b></b><br><br>`;

      reportBody += `🔥🔥 <b>Strong Start to December — Consistent Profits!</b><br>`;
      reportBody += `🔗 <b>Join us & grow your account daily!💰🚀</b><br>`;

    }
    else{
      reportBody = `💥🚀💥🚀<b> Index Options (${HeadingDateFormat(new Date())}) Watchout Today's Super Awesome Premium Channel Performance. </b><br><br>`;
      reportBody += `<b>Trade Summary</b> 👇👇👇👇👇<br><br>`;
      
      marketTrades.forEach((trade, index) => {

          let pips = 0;
          let pnLPoints = 0;
          let profit01 = 0;
          let profit1 = 0;
          let totLots = 2;
          let tradeNote = "";
          let prevCallDate = "";

          const isBuy = trade.tradetype.toLowerCase() === "buy";
          const fromRate = trade.from;
          const toRate = trade.to;
          const diff = toRate - fromRate;

          pips = diff ; 
          pnLPoints = diff;
          profit01 = diff * trade.lotSize * totLots; 


          const entryPrice = trade.from;

          /*if (pnLPoints > entryPrice) {
              tradeNote = "💥💥 Price Doubled N More 💥💥"; // Case: 15 points profit on 10 entry
          } else if (pnLPoints === entryPrice) {
              tradeNote = "💥 Price Doubled 💥";        // Case: 10 points profit on 10 entry
          } else if (pnLPoints >= entryPrice * 0.9) {
              tradeNote = "Price Nearly Doubled"; // Case: 9 points (90%) profit on 10 entry
          }*/

          //const numTimes = formatRateIncrease(entryPrice,pnLPoints);
          const numTimes = formatRateIncrease(fromRate,toRate);
          

          let wholeNum = Math.trunc(parseFloat(toRate/fromRate)); // For positive numbers, Math.floor() also works.
          let decNum = ((toRate/fromRate) - wholeNum).toFixed(2);

          //console.log("Entry - ",fromRate, " PnL - ",toRate," Diff - ", (toRate-fromRate)," Multiplier - ",numTimes.noofTimes," String - ",numTimes.timesString);
          //console.log(wholeNum, decNum);

          if(numTimes.noofTimes === 2){
            //console.log("I am Called");
            tradeNote = "💥💥 Doubled 💥💥"; // Case: 15 points profit on 10 entry
          }
          else if(numTimes.noofTimes === 3){
            tradeNote = "💥💥 Tripled 💥💥";        // Case: 10 points profit on 30 entry
          }
          else if(numTimes.noofTimes >3){
            tradeNote = `💥💥 ${numTimes.timesString} 💥💥`;        // Case: 10 points profit on 10 entry
          }
          else {
            if (toRate >= fromRate * 0.9){
              tradeNote = "💥💥 Nearly Doubled 💥💥"; // Case: 9 points (90%) profit on 10 entry
            }
          }

          /*if (pnLPoints >= entryPrice * 0.9 && pnLPoints < (entryPrice + entryPrice) ) {
              tradeNote = "Price Nearly Doubled"; // Case: 9 points (90%) profit on 10 entry
          }
          else{
            if (numTimes.noofTimes === 1) {
              tradeNote = "💥💥 Price Doubled 💥💥";        // Case: 10 points profit on 10 entry
            }
            else if (numTimes.noofTimes === 2) {
              tradeNote = "💥💥 Price Tripled 💥💥";        // Case: 10 points profit on 30 entry
            }
            else if (numTimes.noofTimes >= 3) {
              tradeNote = `💥💥 ${numTimes.timesString} 💥💥`;        // Case: 10 points profit on 10 entry
            }
          }*/




          totalPips += pips;
          totalProfit01 += profit01;
          let pnlEmoji = "";

          let dtExpiry = "";
          
          if( new Date(trade.expiry).toString()  === "Invalid Date")
            {         dtExpiry = "(" + getRadioValue("expirytype") + ")";
            }
          else {      dtExpiry = formatDateTime(trade.expiry,true);   }
      
          const suffix = (index + 1 === 1) ? "st" : (index + 1 === 2) ? "nd" : (index + 1 === 3) ? "rd" : "th";

          if (new Date(trade.date).toDateString() != new Date(trade.cfdate).toDateString()) {
              prevCallDate = "call given on (" + formatDateTime(trade.cfdate,true) + ")";
          }

          //console.log(tradeNote);
          if(pnLPoints>0){
            reportBody += `➡️ <b>${trade.tradetype} ${trade.script} ${dtExpiry} ${trade.strike} ${trade.option} ${prevCallDate} ${tradeNote}</b><br>`;
            reportBody += `<b>${trade.from} ➝ ${trade.to} = ${pips} Plus Points </b>🤑<br>`;
            /*reportBody += `<b>Total Points: ${pips}</b><br>`;*/
            reportBody += `<b>Maximum Profits: ${profit01}/- For 2 Lots  ➕➕</b><br><br>`;
          }
          else{
            reportBody += `➡️ <b>${trade.tradetype} ${trade.script} ${dtExpiry} ${trade.strike} ${trade.option}</b><br>`;
            reportBody += `<b>${trade.from} ➝ ${trade.to} = ${pips} Points Loss</b>😔<br><br>`;
          }
  
      });


    reportBody += `<b>Amazing Accuracy and Amazing Jackpot Profits By Premium Members</b> 🤑🤑<br><br>`;
    reportBody += `<b>Nearly All Trades</b> <br><b>Perfect Selection Of Entry Levels - </b><br><b>Perfect Movement Caught - </b><br><b>Perfect Target 🎯 🎯 Achieved 😎😎</b><br><br>`;
    reportBody += `<b>Don't Miss To Join Stock Market School (SMS) Premium Channel For Consistent Profits. 💲💲</b><br><br>`;
    reportBody += `<b>Link To Join Our Premium Subscription Is Pinned </b><br>`;
    reportBody += `<b>@ Top In This Channel </b><br><br>`;
    reportBody += `<b>💚💚 Think Hard - Your 1 Day Loss Can Be </b><br>`;
    reportBody += `<b>Our Lifetime Subscription Charges</b> 💚💚`;
          }

    return reportBody;
}

/**
 * Formats a rate increase into a string representation.
 * @param {number} fromRate - The starting rate.
 * @param {number} toRate - The ending rate.
 * @returns {string} - e.g., "Four Times (4x)"
 */
function formatRateIncrease(fromRate, toRate) {
    if (fromRate === 0) return "Cannot divide by zero";

    // Calculate multiplier and drop decimals (3.9x becomes 3x)
    const multiplier = Math.floor(toRate / fromRate);

    // Convert the integer to words (e.g., 4 to "Four")
    const word = numberToWords(multiplier);

    // Capitalize the first letter of the word
    const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);

    //return `${capitalizedWord} Times (${multiplier}x)`;
    return {
    timesString: `${capitalizedWord} Times (${multiplier}x)`,
    noofTimes: multiplier
  };
}

/**
 * Basic helper to convert a number to English words (for integers up to 999).
 */
function numberToWords(num) {
    if (num === 0) return "zero";

    const units = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", 
                   "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    if (num < 20) return units[num];
    
    if (num < 100) {
        return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + units[num % 10] : "");
    }

    if (num < 1000) {
        return units[Math.floor(num / 100)] + " hundred" + (num % 100 !== 0 ? " " + numberToWords(num % 100) : "");
    }

    return num.toString(); // Fallback for extremely large numbers
}


function getRadioValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

const digitEmoji = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];

function toEmojiNumber(n){
  return String(n)
    .split("")
    .map(d => digitEmoji[d])
    .join("");
}

let reportIndianMarket = true;
/* Event Handler for Report Message Markert Type */
const marketRadios = document.querySelectorAll('input[name="markettype"]');
marketRadios.forEach(radio => {
  radio.addEventListener('change', function(event) {
    // The event.target is the specific radio button that was clicked
    const selectedValue = event.target.value;

    selectedValue === "FOREX"? reportIndianMarket=false : reportIndianMarket=true ;

    refreshReportModal();
  });
});

/* THIS FUNCTION IS CALLED WHEN THE USER CHANGES REPORT FOR MARKET TYPE */
function refreshReportModal()
{
  let reportMessage = "";
  reportMessage = generateReportShow(calls);
  editableMessage.innerHTML = reportMessage;
}

function saveEditedMessage() {
  copyToTelegram();  

  const box = document.getElementById("editableMessage");
  box.contentEditable = "false";
  box.classList.add("readonly");
}

async function copyToTelegram() {
    // 1. Get text from the div
    //const message = document.getElementById('editableMessage').innerText;
    const message = getTelegramSafeMessage();
    
    // 2. Comprehensive Copy Function (Works on HTTP & HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
        // Modern approach for HTTPS/localhost
        await navigator.clipboard.writeText(message);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = message;
        
        // Ensure it's not visible but still in the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        
        document.body.removeChild(textArea);
    }
}

function getTelegramSafeMessage() {
  let html = editableMessage.innerHTML;

  // Convert <br> to newline
  html = html.replace(/<br\s*\/?>/gi, '\n');

  // Convert bold tags
  html = html.replace(/<b>/gi, '**');
  html = html.replace(/<\/b>/gi, '**');

  // Remove ALL unsupported tags but keep text
  html = html.replace(/<\/?(div|p|span|font|section|article)[^>]*>/gi, '');

  // Remove ALL attributes
  html = html.replace(/<(\/?\w+)[^>]*>/g, '<$1>');

  // Allow only Telegram-supported tags
  html = html.replace(/<(?!\/?(b|strong|i|em|u|s|code|pre|a)\b)[^>]+>/gi, '');

  return html.trim();
}


function closeModal(id){document.getElementById(id).style.display='none'}

function intiApp(){
    loadScriptsJson();
    loadExpiryJson();
}


intiApp();