"use strict";

// used external res
const 
	urlBlockchainInfo = "https://api.blockchain.info/",
	urlCoinMarketCap = "https://api.coingecko.com/api/v3/simple/price?ids=", 
	urlWhatsonchain_pool = "https://api.whatsonchain.com/v1/bsv/main/mempool/info",  // {"size":22972,"bytes":7593787,"usage":30769136,"maxmempool":64000000000,"mempoolminfee":0}
    urlWhatsonchain_info = "https://api.whatsonchain.com/v1/bsv/main/chain/info",
	urlBlockChair = "https://api.blockchair.com/bitcoin-sv/stats";   // https://github.com/Blockchair/Blockchair.Support/blob/master/API_DOCUMENTATION_EN.md#link_M03


// sockets
// https://bitsocket.org/ for bsv   https://github.com/interplanaria/bitsocket/blob/master/socket.js
const socketBitCoin = ''


// DOM elements
const 
    top_canvas = document.getElementById("topCanvas"),
	top_ctx = top_canvas.getContext("2d"),
	bitCoinPoolInfo = document.getElementById("bitCoin-pool"),
	bitCoinBlock = document.getElementById("bitCoin-block"),
	cashSize = document.getElementById("bitCoin-size"),	
	cashAddress = document.getElementById("bitCoin-address-input"),
	canvas = document.getElementById("renderCanvas"),
	ctx = canvas.getContext("2d"),
	page = document.getElementById("page");
	

	//transactionList = document.getElementById("transactions"),
	//twetchList = document.getElementById("twetch-list"),

// moving items - spries
const loadingGif = new Image(),
	cloud = new Image(),
	carMicroBitCoin = new Image(),
	carSmallBitCoin = new Image(),
	carSmallMedBitCoin = new Image(),
	carMediumBitCoin = new Image(),
	carLargeBitCoin = new Image(),
	carXLargeBitCoin = new Image(),
	carWhaleBitCoin = new Image(),
	carUserBitCoin = new Image(),
	carLambo = new Image(),
	carPeerGame = new Image(),
	carSatoPlay = new Image(),
	carTwetch = new Image(),
	citiyOnchain = new Image(),
	carPowPing = new Image(),
	carMemo = new Image(),    // find eg https://whatsonchain.com/tx/d7b6cf43c481da031238491ab0f13de32024bff633519573d17de225ff350591
	buildingSmall = new Image(),
	buildingMid = new Image(),
	buildingLong = new Image(),
	buildingSquare = new Image(),
	buildingLarge = new Image(),
	bounty = new Image();

loadingGif.src = "assets/loading.gif";

// constants
let WIDTH = null,
	HEIGHT = null,
	SINGLE_LANE = HEIGHT/15, // 15
	SPEED = 10,
	SPEED_MODIFIER = 0.5,
	PRICE_BITCOIN = 300;

// max value for vehicle types in USD
let TX_MICRO = 		0.01,
	TX_SMALL = 		5,
	TX_SMALL_MED = 	1000,
	TX_MEDIUM = 	100000,
	TX_LARGE =  	500000,
	TX_WHALE = 		10000000,
	BOUNTY_LANE    = Math.floor(Math.random() * 10) + 3,
	BOUNTY_VISIBLE = false;

// animation
let requestID = null,
	BSV_BLOCKS = '', // for pull - no push by sockets yet
	seqNr = 0;

// booleans
let isVisible = true,
	konamiActive = false;


// arrays for vehicles
let txBitCoin = [],
	txPosts = [],
	last_blocks = [],
	feesBitCoin = [];

//var EventSource = require('..') ?? 

// Write a bitquery - unwriter
var query = {
  "v": 3, "q": { "find": {} }
}

// Encode it in base64 format
var b64 = btoa(JSON.stringify(query))

var bitsocket = {
  source: null,
  events: {},
  open: function(query) {
	var url ='https://bob.bitsocket.network';
    bitsocket.source = new EventSource(url +'/s/'+b64)
    bitsocket.source.addEventListener('message', function(e) {
      var m = JSON.parse(e.data)
      if (bitsocket.events.message) {
        if (m.type != "open") {
		  bitsocket.events.message(m)
        }
      }
    }, false)
    bitsocket.source.addEventListener('open', function(e) {
      if (bitsocket.events.open) {
        bitsocket.events.open(e)
      }
    }, false)
    bitsocket.source.addEventListener('error', function(e) {
   //   console.log("state = ", e.target.readyState)
      if (e.target.readyState == EventSource.CLOSED) {
        console.log("bob - CLOSED")
        if (bitsocket.events.close) {
          bitsocket.events.close(e)
        }
      } else if (e.target.readyState == EventSource.CONNECTING) {
    //    console.log("Connecting...", e);
        if (bitsocket.events.close) {
          bitsocket.events.close(e)
        }
      }
    }, false)
  },
  close: function() {
    bitsocket.source.close()
    if (bitsocket.events.close) {
      bitsocket.events.close()
    }
  },
  on: function(type, cb) {
    bitsocket.events[type] = cb;
  }
}


bitsocket.open('');
bitsocket.on("message", function(m) {
    var data = m.data;
	for(let l in data) {
		var valueOut = 0;
		var size = memorySizeOf(data[l]);
		var addr ='';
		var ops = '';
		var ops_inf = '';
		for(let k in data[l].out) {
		//	console.log(valueOut)
		   if (data[l].out[k].e.v && data[l].out[k].e.v > 0) valueOut = valueOut + (data[l].out[k].e.v  / 100000000);
            if (data[l].out[k].tape[0].cell[0].ops == 'OP_RETURN' || data[l].out[k].tape[0].cell[1].ops == 'OP_RETURN') {
				ops = ops + data[l].out[k].tape[0].cell[0].ops + data[l].out[k].tape[0].cell[1].ops;
				ops_inf = data[l].out[k].tape[1].cell[0].s;
				if ( data[l].out[k].tape[1].cell[0].s2) ops_inf = ops_inf + ' ' + data[l].out[k].tape[1].cell[0].s2;
			}
		}
		if (data[l].out[0].e.v > 0) {
			addr =  data[l].out[0].e.a;
		}
		else {
			addr =  data[l].out[1].e.a;
		}
		seqNr = seqNr + 1;
		//if (valueOut*10 >= 1 || ops_inf != '') {
		//console.log(seqNr + " val: " + valueOut + " > " +addr);  //[1].out.i);
		//	console.log(addr + ' to ' + ops_inf);
		//}	
		//if (ops_inf) ops_inf = ops_inf.substring(0,249);
		if (size> 20000) console.log(data[l].tx.h + ' big mem size:  ' + size);
		
		let outs_ = [];
		outs_.push({"addr":addr, "value": valueOut});
			var txData = {
				"out": outs_,
				"hash": data[l].tx.h,   //data.txid,
				"inputs": [],
				"valueOut": valueOut,
				"isBitCoin": true,
				"feature": ops_inf,
				"icon"  : '',
				"memorySize": size
			}
		
		//	setTimeout(() => {
				newTX(true, txData);	
		//	}, 10);
	
	}

}) // Subscribe

function memorySizeOf(obj) {
    var bytes = 0;

    function sizeOf(obj) {
        if(obj !== null && obj !== undefined) {
            switch(typeof obj) {
            case 'number':
                bytes += 8;
                break;
            case 'string':
                bytes += obj.length * 2;
                break;
            case 'boolean':
                bytes += 4;
                break;
            case 'object':
                var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if(objClass === 'Object' || objClass === 'Array') {
                    for(var key in obj) {
                        if(!obj.hasOwnProperty(key)) continue;
                        sizeOf(obj[key]);
                    }
                } else bytes += obj.toString().length * 2;
                break;
            }
        }
        return bytes;
    };

    function formatByteSize(bytes) {
        if(bytes < 1024) return bytes + " bytes";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
        else return(bytes / 1073741824).toFixed(3) + " GiB";
    };
  	//return formatByteSize(sizeOf(obj));
    return sizeOf(obj);
};

var carBitCoin_ref = 'https://whatsonchain.com/tx/';  // + item.id;

// initialise everything
function init(){
	// setup canvas
	canvas.width = window.innerWidth; 
	canvas.height = window.innerHeight;
	top_canvas.width = window.innerWidth; 
	top_canvas.height = window.innerHeight;
	
	// listenners
	window.addEventListener("load", resize, false);
	window.addEventListener("resize", resize, false);
	
	cloud.src = "assets/sprites/speech.png";  //dialog_cloud.png";  // cloud_tra.png";

	//cash vehicles
	carMicroBitCoin.src = "assets/sprites/bsv-micro.png";
	carMicroBitCoin.onclick = function() {  // does not work ...
    	window.location.href = carBitCoin_ref; 
	};	
	//	console.log("link img id:" + item.id);
	//					document.body.appendChild(car);
							
	carSmallBitCoin.src = "assets/sprites/bsv-small.png";
	carSmallBitCoin.onclick = function() {
    	window.location.href = carBitCoin_ref; 
	};		
	carSmallMedBitCoin.src = "assets/sprites/bsv-small-med.png";
	carSmallMedBitCoin.onclick = function() {
    	window.location.href = carBitCoin_ref; 
	};	
	carMediumBitCoin.src = "assets/sprites/bsv-medium.png";
	carMediumBitCoin.onclick = function() {
    	window.location.href = carBitCoin_ref; 
	};	
	carLargeBitCoin.src = "assets/sprites/bsv-large.png";
	carLargeBitCoin.onclick = function() {
    	window.location.href = carBitCoin_ref; 
	};		
	carXLargeBitCoin.src = "assets/sprites/bsv-xlarge.png";
	carXLargeBitCoin.onclick = function() {
    	window.location.href = carBitCoin_ref; 
	};		
	carWhaleBitCoin.src = "assets/sprites/bsv-whale.png";
	carWhaleBitCoin.onclick = function() {
    	window.location.href = carBitCoin_ref; 
	};		
	carUserBitCoin.src = "assets/sprites/tx-taxi.png"; 
	carLambo.src = "assets/sprites/lambo.png";

	carPeerGame.src = "assets/sprites/peergame.png";
	carSatoPlay.src = "assets/sprites/satoplay.png";
	carTwetch.src = "assets/sprites/twetch.svg";
	carMemo.src = "assets/sprites/peergame.png";
	carPowPing.src = "assets/sprites/powping.png";

	buildingSmall.src = "assets/sprites/building_small.png";
	buildingLong.src = "assets/sprites/building_long.png";
	buildingMid.src = "assets/sprites/building_mid.png";
	buildingSquare.src = "assets/sprites/building_square.png";
	buildingLong.src = "assets/sprites/building_long.png";
	buildingLarge.src = "assets/sprites/building_large.png";
	
	bounty.src = "assets/sprites/present.jpg";
    
	// start animation
	requestID = requestAnimationFrame(animate);

	// acquire data for signs
	updateMempoolData();
	setTimeout(() => {
		updatePriceData();	
	}, 3000);
	
	// remove loading screen
	onReady(function () {
		show('page', true);
		show('loading', false);
	});

}

function show(id, value) {
    document.getElementById(id).style.display = value ? 'block' : 'none';
}



function mobileCheck(){
	let check = false;
	(function(a,b){
		if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
			check=true;
	})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}


function updatePriceData(){
 	getPriceData(urlBlockChair, true);
}


// get price in usd for bitcoin & btc
function getPriceData(url, isBSV){
	let xhr = new XMLHttpRequest();
	xhr.onload = function(){
		if (xhr.readyState == 4 && xhr.status == 200) {		
			let res = JSON.parse(xhr.responseText);

		  for(let k in res) {
		      if(res[k] instanceof Object) {
		    	  //console.log(isBSV + "  Txs - from price: " + res[k].blocks);  //.market_price_usd);
				  if (isBSV && BSV_BLOCKS < res[k].blocks -3)  {  // blockchair stats are not actual
					//console.log("Blocks - from price get: " + res[k].blocks);
						
						BSV_BLOCKS = res[k].best_block_height;
						bitCoinBlock.textContent = '' + BSV_BLOCKS;
						//console.log("Blocks - last array: " + last_blocks.length); 
						
						if (BSV_BLOCKS && last_blocks.length < 1) {
							for (let i = 0; i<= 11; i++) {  // slowly get some block data...
								setTimeout(() => { 
									fetch_block_data(BSV_BLOCKS - 11 + i);
								}, 2000 * i);
							}
						}
						blockNotify('', true);	
					} //else if (res[k].blocks) BTC_BLOCKS = res[k].best_block_height;
				  
		        //  console.log(res[k].market_price_usd);
					if (res[k].market_price_usd > 1){ //} "BSV"){
						//bitCoinPoolInfo.textContent = formatWithCommas(res[k].transactions);
						//console.log(res[k].transactions);
						PRICE_BITCOIN = res[k].market_price_usd;
						//console.log("price - from price get: " + PRICE_BITCOIN);
						//document.getElementById("price_bitcoin").textContent = "USD $" + formatWithCommas(parseFloat(PRICE_BITCOIN).toFixed(2));
					
					if (isBSV)
						//if (!PRICE_BITCOIN) PRICE_BITCOIN = res.market_price_usd;
						document.getElementById("price_bitcoin").textContent = "USD $" + formatWithCommas(parseFloat(PRICE_BITCOIN).toFixed(2));
					} //else if (!isBSV) {  //  if (res[0].price_usd >0)  
					//	PRICE_BTC = PRICE_BITCOIN;  // res[0].market_price_usd;  // res[0].bitcoin.usd;
					//	console.log(PRICE_BTC + ' btc ' + BTC_BLOCKS);
					//	document.getElementById("price_btc").textContent = "USD $" + formatWithCommas(parseFloat(PRICE_BTC).toFixed(2));
					//	coreBlock.textContent = '' + BTC_BLOCKS;
					//}
				}
			}
		}
	}
	xhr.open('GET', url, true);
	xhr.send(null);
}

// adds thousands seperator to large numbers
function formatWithCommas(x){
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");	
}

// adds twechtes
function fetch_Twetch() {
  (async () => {
        function addToList(o, add_) {
			let listItem = document.createElement("LI");
            var anchor = document.createElement("a");
			let txt = '(Twetch icon post)';
			let t_ref = 'https://twetch.app';
			if (o.bContent && o.bContent != '0' &&  o.bContent != 'null' &&  o.bContent != 'undefined') txt = o.bContent;
			let textNode = document.createTextNode(txt);  //+ ' MB: ' + o.moneyButtonUserId + ' u: ' + o.userId);
 //if (o.userByUserId.name) a.textContent = a.textContent + ' name: ' + o.userByUserId.name;
			t_ref =  `https://twetch.app/t/${o.transaction}`;
            anchor.setAttribute('href',t_ref);
			anchor.setAttribute("target", "_blank");
			if (o.userByUserId.icon)  { 
				listItem.src = o.userByUserId.icon;  
				listItem.setAttribute("style", "background-image: url(" + o.userByUserId.icon + ");");
			}
//			listItem.className = "txinfo-cash";
//
//			anchor.appendChild(textNode);
//			listItem.appendChild(anchor);
//			if (add_) twetchList.insertBefore(listItem, twetchList.firstChild);
//			if (twetchList.childNodes.length > 18){
//				twetchList.removeChild(twetchList.childNodes[twetchList.childNodes.length -1]);
//			}
			
			let ic = new Image();
			ic.src = o.userByUserId.icon;
			
			let outs_ = [];
			outs_.push({"addr": o.userId, "value": o.bContent});
			var txData = {
				"out": 		outs_,
				"hash": 	o.transaction,   //data.txid,
				"inputs": 	[],
				"valueOut": txt,
				"isBitCoin": 	true,
				"feature": 	'twetch',
				"t_ref":	t_ref,
				'icon':		ic,  //o.userByUserId.icon
				"memorySize": 0  // find out
			}
			if (!add_) newTX(true, txData);
        }

        var twetch = new twetchjs();
		const response = await twetch.query(`            query {
                allPosts( 	first: 18,
							orderBy: CREATED_AT_DESC
				) 
				{  edges {
 					node { bContent transaction userId moneyButtonUserId userByUserId {icon name}}
                    }
                }
            }
        `);
		for (let i = 0; i < response.allPosts.edges.length; i++) {
            if (response.allPosts.edges[i] && response.allPosts.edges[i].node) addToList(response.allPosts.edges[i].node, true);
        }
        for (let i = response.allPosts.edges.length -1; i>= 0; i--) { // send cars in correct order
            if (response.allPosts.edges[i] && response.allPosts.edges[i].node) addToList(response.allPosts.edges[i].node, false);
        }

	})();
}

let poll_lock = false;

// notify users when a new block is found
function blockNotify(data, isBitCoin){
	let t = 0;
	let ticker = "";
	let amount = 0;
	let new_data = true;

	if(isBitCoin || !data){
		new_data = false;
		ticker = "BSV";
		fetch_Twetch();
		setTimeout(() => {
			getPoolData(urlWhatsonchain_pool, true);
			if (!poll_lock) {
				poll_lock = true;
				setTimeout(() => {
						let xhr = new XMLHttpRequest();
						xhr.timeout = 4000;
	 // {"chain":"main","blocks":648520,"headers":648520,"bestblockhash":"000000000000000000701cffdf682064629d809297f351f6558980c2f9c6322a","difficulty":298041066507.4231,"mediantime":1597647042,"verificationprogress":0.9999996458643543,"pruned":false,"chainwork":"00000000000000000000000000000000000000000116962bb79c272f051fdee5"}
						xhr.onreadystatechange = function () {
							if (xhr.readyState >= 2 && xhr.status == 200) {
							console.log('xhr ..? ' + xhr.readyState);
						    //console.log('xhr ..' + xhr.status);
								if (xhr.readyState >= 2) {
									xhr.responseText;
									let res = JSON.parse(xhr.responseText);
									 //res = JSON.parse(xhr.responseText);
									//console.log('*** BSV pull block ' + res.blocks);
									
									if (BSV_BLOCKS <  res.blocks) {
										new_data = true;
										BSV_BLOCKS = res.blocks;
										console.log('*** New BSV block: ' + BSV_BLOCKS);
										bitCoinBlock.textContent = '' + BSV_BLOCKS;
										fetch_block_data(BSV_BLOCKS);
										posi = 0;
									
									//	document.getElementById("spot4").src = carTwetch.src;
									}
								}
							} 
							//console.log('abort ..');
							xhr.abort(); 
						}
						xhr.open('GET', urlWhatsonchain_info, true);
						xhr.send();
					setTimeout(() => { 
						poll_lock = false;
						blockNotify('', true);  // repeat
					}, 8000);
				}, 5000);
			}
		}, 1000);
	} 
	setTimeout(() => {
		updatePriceData();
	}, 8000);
}

//  https://api.whatsonchain.com/v1/bsv/main/block/height/648520 <height>
// {"hash":"000000000000000000701cffdf682064629d809297f351f6558980c2f9c6322a","confirmations":5,"size":8147778,"height":648520,"version":541065216,"versionHex":"20400000","merkleroot":"3c71f4a1254f2adae193269238a22cb79e0a7a8cd6a2126c46ed5035dc49ceb6","txcount":39281,"tx":
function fetch_block_data (height) {
	let xhr = new XMLHttpRequest();
	xhr.timeout = 4000;
	 // {"chain":"main","blocks":648520,"headers":648520,"bestblockhash":"000000000000000000701cffdf682064629d809297f351f6558980c2f9c6322a","difficulty":298041066507.4231,"mediantime":1597647042,"verificationprogress":0.9999996458643543,"pruned":false,"chainwork":"00000000000000000000000000000000000000000116962bb79c272f051fdee5"}
	xhr.onreadystatechange = function () {
		if (xhr.readyState >= 3 && xhr.status == 200) {
		//console.log('new block xhr ..' + xhr.readyState);
	    //console.log('xhr ..' + xhr.status);
			if (xhr.readyState >= 3) {
				xhr.responseText;
				let res = JSON.parse(xhr.responseText);
				 //res = JSON.parse(xhr.responseText);
				//console.log(height + '*** new block BSV pull txcount ' + res.txcount);
				if ( res.size) {
					let item = {
					//type:type,
						block: height,
						size: res.size,
						txcount: res.txcount
					};
					
					last_blocks.push(item);
					SPEED = 8;
				//	let t = parseInt(bitCoinPoolInfo.textContent.replace(/\,/g,''));	  
				//	bitCoinPoolInfo.textContent = formatWithCommas(t - res.size);
				}
			}
			xhr.abort(); 
		}
	}
	xhr.open('GET', 'https://api.whatsonchain.com/v1/bsv/main/block/height/'+height, true);
	xhr.send();
}

//gets latest utx count and sets it to signs
function updateMempoolData(){
	// https://api.whatsonchain.com/v1/bsv/main/mempool/raw  or https://api.whatsonchain.com/v1/bsv/main/tx
	//let bsv_url =  "https://whatsonchain.com/block-height/646558";
	getPoolData( urlWhatsonchain_pool, true);
}

// retrieve pool information for signs
function getPoolData(url, isBitCoin){
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			let obj = JSON.parse(xhr.responseText);
			if (isBitCoin){
				bitCoinPoolInfo.textContent = formatWithCommas(obj.size);
				//console.log('BSV pool data: ' + obj.size);  //{"size":22972,"bytes":7593787,"usage":30769136,"maxmempool":64000000000,"mempoolminfee":0}
			} 
		xhr.abort();
		} 
	}
	xhr.open('GET', url, true);
	xhr.send();
}

// resize the window
function resize(){
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	SINGLE_LANE = HEIGHT/15;
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	top_canvas.width = WIDTH;
	top_canvas.height = HEIGHT;
}


// pause everything when window loses focus
let vis = (function(){
    let stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        	return !document[stateKey];
    }
})();

vis(function(){
	if (vis()){
		txBitCoin = [];
		requestAnimationFrame(animate);
		isVisible = true;
	} else{
		cancelAnimationFrame(requestID);
		isVisible = false;
	}
});

// create a new transaction
function newTX(isBitCoin, txInfo){
	if (isBitCoin){
		let tx_already_Exsists = false;
		//console.log('txBitCoin: ' + txBitCoin.length);
		txBitCoin.forEach(e => {
			if(e.id == txInfo.hash && e.feature == txInfo.feature) tx_already_Exsists = true;
		});
		if (tx_already_Exsists) return;
		let t = parseInt(bitCoinPoolInfo.textContent.replace(/\,/g,''));			
		bitCoinPoolInfo.textContent = formatWithCommas(t +1);
		let randLane = Math.floor(Math.random() * 10) + 4;
		createVehicle(isBitCoin, txInfo, randLane, true);
	} 
}

// adds tx info to the side list
function addTxToList(item, car){
	
	let listItem = document.createElement("LI");
	let anchor = document.createElement("A");
	let text = "txid: " + item.id.substring(0, 7) + "...\n";
	text += "value: " + item.valueOut.toString().substring(0,9);
//	let textNode = document.createTextNode(text);
//	
//	anchor.setAttribute("target", "_blank");
//	listItem.setAttribute("style", "background-image: url(" + car.src + ");");
//
//    if (item.isBitCoin){
//		listItem.className = "txinfo-cash";
//		anchor.setAttribute("href", "https://whatsonchain.com/tx/" + item.id);
//    } else {
//		listItem.className = "txinfo-core";
//		anchor.setAttribute("href", "https://btc.com/" + item.id);
//    }
//
//	anchor.appendChild(textNode);
//	listItem.appendChild(anchor);
//	transactionList.insertBefore(listItem, transactionList.firstChild);
//	if (transactionList.childNodes.length > 50){
//		transactionList.removeChild(transactionList.childNodes[transactionList.childNodes.length -1]);
//	}

	
}

// create vehicles and push to an array
function createVehicle(type, txInfo, lane, isBitCoin){
	let donation = false;
	let userTx = false;  //isUserTx(txInfo);
	let sdTx = false;
	let fee = 0;
	let valOut = 0;
	let valIn = 0;
	let arr = txBitCoin;

	txInfo.inputs.forEach((input)=>{
		valIn += input.prev_out.value;
	});
	txInfo.out.forEach((tx)=>{
		valOut += tx.value/100000000;
	});
	fee = (valIn - valOut *100000000)/100000000;
	if (fee < 0) fee = 0;
	if (isBitCoin){
	    donation = isDonationTx(txInfo);
	}
	//if (fee != 0) updateFees(isBitCoin, fee);
	if(txInfo.valueOut){
		valOut = txInfo.valueOut;
	}
	let car = getCar(valOut, donation, isBitCoin, userTx, sdTx, txInfo);
	let width = 40;
	if (car.width) width = SINGLE_LANE * (car.width / car.height);
	//console.log( car.width + ' car widht : ' + width + ' high ' + car.height);
	//if (car == cloud)  width = SINGLE_LANE * (car.width / car.height) * 3;
	let x = -width;
	// fix vehicle positioning to prevent pile ups.
	if (arr.length > 0){
		arr.forEach((key) => {
			if (width >= key.x && lane == key.lane){
				x = key.x - width - 20;
			}
		});
	}
	let height = SINGLE_LANE;
	if (car == cloud) {
		height = SINGLE_LANE * 2;
		lane = 13;
		width = width*1.6;
	}
	let memorySize = txInfo.memorySize;
	if (memorySize > 20000) {
		height = SINGLE_LANE * 1.8;
		width = width*1.7;	
	//	lane = lane -  SINGLE_LANE *.3;
	} else if (memorySize > 5000) {
		height = SINGLE_LANE * 1.4;
		width = width*1.1;	
	}
	
	let item = {
		//type:type,
		id: txInfo.hash,
		car: car,
		x: x,
		lane: lane,
		h: height,
		w: width,
		valueOut: valOut,
		donation: donation,
		userTx: userTx,
		feature: txInfo.feature,
		icon: txInfo.icon,
		t_ref: txInfo.t_ref,
		isBitCoin: isBitCoin
	};
	arr.push(item);
	
	if (arr.length > 1000) arr.shift();
}


/* return car based upon transaction size*/
function getCar(valueOut, donation, isBitCoin, userTx, sdTx, txinfo){
	var sw = txinfo.sw;

	//console.log("look "+  txinfo.feature);
	if (txinfo.feature && txinfo.feature.indexOf('satoplay') >= 0 ) {  
	//	console.log("found "+  txinfo.feature);
		return carSatoPlay;
	}
	if (txinfo.feature && txinfo.feature.indexOf('peergame') >= 0 ) {  
	//	console.log("found "+  txinfo.feature);
		return carPeerGame;
	}	
	if (txinfo.feature && txinfo.feature.indexOf('wetch') >= 0 ) {  // &  feature.indexOf('peergame') !== -1 ) {  // like peergame toLowerCase().
		console.log("found "+  txinfo.feature);
		return carTwetch;  // cloud
	}	
	
	if (donation == true){
		SPEED = 4;
		return carLambo;
	}	

	// user tx vehicles need to go here
	if (userTx){
		console.log("*** found user car " +  txinfo.feature);
		if (isBitCoin){
			return carUserBitCoin;
		} 
	}
	let val = 0;
	if (isBitCoin){
		let memorySize = txinfo.memorySize;
		// if (memorySize > 20000) return carWhaleCore;  // lol
		if (valueOut > 0) val = valueOut * PRICE_BITCOIN;
	}
	if (val <= TX_MICRO){
		if (isBitCoin){
			return carMicroBitCoin;
		}

	} else if (val > TX_MICRO && val <= TX_SMALL){
		if (isBitCoin){
			return carSmallBitCoin;
		} 
	} else if (val > TX_SMALL && val <= TX_SMALL_MED){	
		if (isBitCoin){
			return carSmallMedBitCoin;
		} 
	} else if (val > TX_SMALL_MED && val <= TX_MEDIUM){
		if (isBitCoin){
			return carMediumBitCoin;
		} 
	} else if (val > TX_MEDIUM && val <= TX_LARGE){
		if (isBitCoin){
			//carBitCoin_ref = 'https://whatsonchain.com/tx/'+ txinfo.hash;

			return carLargeBitCoin;
		} 
	} else if (val > TX_LARGE && val <= TX_WHALE){
		if (isBitCoin){
			//carBitCoin_ref = 'https://whatsonchain.com/tx/'+ txinfo.hash;
		
			return carXLargeBitCoin;
		} 
	} else if (val > TX_WHALE){
		if (isBitCoin){
			carBitCoin_ref = 'https://whatsonchain.com/tx/'+ txinfo.hash;	
			return carWhaleBitCoin;
		} 
	}
}

// check for donations into the BCF
let isDonationTx = function(txInfo){
	let vouts = txInfo.out;//.vout;
	let isDonation = false;

	vouts.forEach((key)=>{
		let k = key.addr;
		
		if (k == "1Kzyw6qrLP59vdf5QseP3vxn2W5av9KSr1") {
					isDonation = true;
					//setTimeout(getDevDonations(), 3000);
		}
	});

	return isDonation;
}


// check for transactions to user's addresses
let isUserTx = function(txInfo){
	let vouts = txInfo.out;//.vout;
	let result = false;
	vouts.forEach((key)=>{
		let keys = Object.keys(key);
		//console.log(  key.addr + '  ?? user addr: '+ cashAddress.value);
		if (key.addr == cashAddress.value ){
			console.log('*****  found user addr: '+ cashAddress.value);
			result = true;
		}
		if ( key.feature) {
		console.log(  key.feature + '  ?? user addr: '+ cashAddress.value);
			if ('' + key.feature == '' + cashAddress.value ){
				console.log('found user addr: '+ cashAddress.value);
				result =  true;
			} 
		}
	});
	return result;
}


function wrapText(context, text, x, y, maxWidth, lineHeight) {
	text = text + '';
    var words = text.split(' ');
    var line = '';
    var lineCount = 0;

    for (var n = 0; n < words.length && lineCount < 4; n++) {
        var testLine = line + words[n].substring(0,23) + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            if (line) context.fillText(line.substring(0,24), x, y);
            line = words[n].substring(0,23) + ' ';
            y += lineHeight;
			lineCount += 1;
        } else {
            line = testLine;
        }
    }
    context.fillText(line.substring(0,22) + '...', x, y);
} 

function link_Text(ctx, linkURL, linkX, linkY, linkWidth, linkHeight) {
        var isLink = false;
        function drawHyperLink() {
           // canvas = document.getElementById("myCanvas");
            // check if supported
            if (ctx) {
            //     canvas.addEventListener("mousemove", CanvasMouseMove, false); -- too slow!
                canvas.addEventListener("click", Link_click, false);
            }
        }
        function CanvasMouseMove(e) {
            var x, y;
            if (e.layerX || e.layerX == 0) { // for firefox
                x = e.layerX;
                y = e.layerY;
            }
            x -= canvas.offsetLeft;
            y -= canvas.offsetTop;
            if (x >= linkX && x <= (linkX + linkWidth) 
                    && y  - linkHeight <= linkY && y >= linkY) {
                document.body.style.cursor = "pointer";
                isLink = true;
            }
           // else {
           //     document.body.style.cursor = "";
           //     isLink = false;
           // }
        }
        function Link_click(e) {
	 var isLink = false;
	            var x, y;
            if (e.layerX || e.layerX == 0) { // for firefox
                x = e.layerX;
                y = e.layerY;
            }
            x -= canvas.offsetLeft;
            y -= canvas.offsetTop;
            if (x >= linkX && x <= (linkX + linkWidth) 
                    && y  - linkHeight <= linkY && y >= linkY) {
                document.body.style.cursor = "pointer";
                isLink = true;
            }
            if (isLink) {
                window.location = linkURL;
            }
        }
	drawHyperLink();
}

var last_dist_x = 0;

let posi = 0;
// loop through transactions and draw them
function drawVehicles(arr){
	let car = null;
	let y = -1000;
	let width = 0;
	let isBitCoin = true;
	let count = 0;
	if (SPEED < 16) SPEED += posi/100000;
	if (BOUNTY_VISIBLE) {
		wrapText(ctx, "Collect with your special car >>", WIDTH - 220, BOUNTY_LANE*SINGLE_LANE+ SINGLE_LANE*.5, 80, 11);
		ctx.drawImage(bounty, WIDTH - 150, BOUNTY_LANE*SINGLE_LANE+ SINGLE_LANE*.2, SINGLE_LANE*0.6 , SINGLE_LANE*0.6);
		
		//console.log(' - *****  ' + last_blocks.length);
		let last_with = 0;
		for (let i = 0; i<= 10; i++) {
			//console.log(last_blocks.length);  // + ' - size ' + e.size);
			if (posi< WIDTH/2) posi += 0.002;
			last_blocks.forEach(e => {
			if ( BSV_BLOCKS - e.block -i == 0) { 
				
				if (e.size > 100000000) {
					ctx.drawImage(buildingLarge, WIDTH - 150 - posi - last_with, HEIGHT - SINGLE_LANE*2.2,  buildingLarge.width/10, buildingLarge.height/10);
					link_Text(ctx,'https://whatsonchain.com/block-height/'+ e.block, 
							WIDTH - 150 - posi - last_with, HEIGHT - SINGLE_LANE*2.1, buildingLarge.width/10, buildingLarge.height/10);	
					last_with += buildingLarge.width/10 + 4;
				//	console.log(e.block + ' - size ' + e.size);
				} else if (e.size > 10000000) {
					ctx.drawImage(buildingSquare, WIDTH - 150- posi -last_with , HEIGHT - SINGLE_LANE*2.1, buildingSquare.width/8, buildingSquare.height/8);
					link_Text(ctx,'https://whatsonchain.com/block-height/'+ e.block, 
							WIDTH - 150 - posi - last_with, HEIGHT - SINGLE_LANE*2.1, buildingSquare.width/8, buildingSquare.height/8);
					last_with += buildingSquare.width/8 + 4;
			//		console.log(e.block + ' - size ' + e.size);
				//ctx.drawImage(building, WIDTH - 650, HEIGHT - SINGLE_LANE*2, buildingLarge.width/8, SINGLE_LANE*1.7);
				//ctx.drawImage(buildingLarge, WIDTH - 150, HEIGHT - SINGLE_LANE*2, buildingLarge.width/8, SINGLE_LANE*1.7);
				} else if (e.size > 1000000) { 
					ctx.drawImage(buildingMid, WIDTH - 150- posi - last_with, HEIGHT - SINGLE_LANE*2.1, buildingMid.width/4, buildingMid.height/4);
					link_Text(ctx,'https://whatsonchain.com/block-height/'+ e.block, 
							WIDTH - 150 - posi - last_with, HEIGHT - SINGLE_LANE*2.1, buildingMid.width/4, buildingMid.height/4);					
					last_with += buildingMid.width/4 + 4;
				} else if (e.size > 100000) {
					ctx.drawImage(buildingLong, WIDTH - 150 - posi -last_with + 10, HEIGHT - SINGLE_LANE*2.1, buildingLong.width/2, buildingLong.height/2);
					link_Text(ctx,'https://whatsonchain.com/block-height/'+ e.block, 
							WIDTH - 150 - posi - last_with, HEIGHT - SINGLE_LANE*2.1, buildingLong.width/2, buildingLong.height/2);
					last_with += buildingLong.width/2 + 14;
				} else { 
					ctx.drawImage(buildingSmall, WIDTH - 150- posi - last_with + buildingSmall.width*0.8 + 10, HEIGHT - SINGLE_LANE*2.1, buildingSmall.width/2, buildingSmall.height/2);
					//ctx.drawImage(buildingSmall, WIDTH - 150 - posi - last_with, HEIGHT - SINGLE_LANE*2.1, buildingSmall.width/2, buildingSmall.height/2);
					link_Text(ctx,'https://whatsonchain.com/block-height/'+ e.block, 
							WIDTH - 150 - posi - last_with  + buildingSmall.width*.6, HEIGHT - SINGLE_LANE*2.1, buildingSmall.width/2, buildingSmall.height/2);						
					last_with += buildingSmall.width -10; // buildingSmall.width = 70)
				}
			}
			});	
		}
	}
	arr.slice().reverse().forEach(function(item, index, object){
		if (item.x > WIDTH + 200 || item.lane < 1) return; 
		if(!item.isBitCoin && konamiActive) { 
			car = item.car;;
		} else {
			car = item.car;
		}
		let intro = -car.width - SPEED;
		if (!item.isBitCoin) intro = -car.width - SPEED * SPEED_MODIFIER; // a twetch ?
		if (item.x > intro){
			if (!item.isPlaying){
				addTxToList(item, car);
			}
			item.isPlaying = true;

			y = (item.lane * SINGLE_LANE) - SINGLE_LANE;
			width = SINGLE_LANE * (car.width / car.height);

			if (item.isBitCoin){
				if (  item.donation || car == carTwetch || car == carPeerGame || car == carSatoPlay ) {
					BOUNTY_VISIBLE = true;
					if (count % 10 == 1) BOUNTY_LANE = Math.floor(Math.random() * 10) + 3;
					y = (1.6 * SINGLE_LANE) ; //- SINGLE_LANE;
					//item.x += SPEED / 2; 
					if (item.x >= WIDTH / 2 &&  item.x < WIDTH) { // stop for some blocks
						if(car == carTwetch || car == cloud) {
							item.x -= SPEED / 5; 
						} else item.x -= SPEED ;
						y -= SINGLE_LANE *0.85;
						let car_im =  car.src;
						if (count % 10 == 1) setTimeout(() => {
							document.getElementById("spot6").src = car_im;
							setTimeout(() => {
								item.x = WIDTH + 1000;
								document.getElementById("spot6").src = '';
								document.getElementById("spot6").src = loadingGif.src;  //"assets/loading.gif";
							}, 8000);
							//BOUNTY_VISIBLE = false;
						}, 2000);
					} else {
						item.y -= 1;
					}
				} else if (item.lane == 3 ) {  // special slow down
					item.x -= 2;
					if (item.x >= WIDTH / 6) {
						item.x -= 2;
					}
					if (item.x >= WIDTH / 4) {
						item.x -= 0.6;
					}					
					if (item.x >= 4 * WIDTH / 5 ) {
						item.x -= 0.2; // SPEED ; // - transactionShowList.childNodes.length/20;
						//item.x += 3.2;
						//console.log(" speed " + item.x);
					}
				}
			}
			if (car == carTwetch) {  //add cloud text
				ctx.font = "10pt";  //" Verdana";
				ctx.drawImage(car, item.x, y + SINGLE_LANE*0.8, width*0.35 , item.h*0.35);
				let cy = y+item.x*1.7 +SINGLE_LANE*1.5;
				//let cyt = y+item.x;
				if(cy > SINGLE_LANE*12) {
					cy = SINGLE_LANE*12;
				
					if(item.x > WIDTH/3 -30){ 
						cy -= item.x*0.45 -  SINGLE_LANE*3;
					}
				}
				ctx.drawImage(cloud, item.x, cy, width, item.h*1.9);
				wrapText(ctx, item.valueOut, item.x + width*0.2, cy + SINGLE_LANE/2, width*0.7, 11);
				//link_Text(ctx, item.t_ref, item.x + width*0.2, cy + SINGLE_LANE/2, width*0.7, 11);
				
				//imgError(item.icon);
				// test ? top_ctx.drawImage(item.icon,0,0,0,0);
				try {
				if (item.icon) ctx.drawImage(item.icon, item.x, cy + SINGLE_LANE*1.3, width/5, item.h*0.5);
				} catch (e) {
                	if (e && e != 'undefinded' && (e+'').substring(0,17) != 'InvalidStateError') console.log('Catch error: ' + (e+'').substring(0,16));
            	}
				// .setAttribute('href',item.t_ref);
				//console.log('Cloud: ' + item.x);
			} else ctx.drawImage(car, item.x, y, width, item.h*0.95);
			
		} 
		// move sprites
		if(car == carTwetch || car == cloud) {
			if (item.x < WIDTH / 2 ) item.x += SPEED / 5;
		} else if(item.isBitCoin && car != carTwetch){
			item.x += SPEED;
			count += 1;
		} else {
			let spd = SPEED * SPEED_MODIFIER;
			item.x += spd;
			isBitCoin = false; // why ?
		}
	});

//$(window).load(function() {
  $('img').each(function() {
    if ( !this.complete
    ||   typeof this.naturalWidth == "undefined"
    ||   this.naturalWidth == 0     
	// ||   this.onerror             function this.style dislpay ... 'none'
	) {
      // image was broken, replace with your new image
		//console.log('New error: ' + this.onerror);
      	if ( !this.complete) this.src = carTwetch.src;
    }
  })
}

// remove vehicles that are off the map
function removeVehicles(){
 	document.querySelectorAll('img').forEach((img) => {
	  	img.onerror = function() {
	    this.style.display = 'none';
	  }
	});

	txBitCoin.forEach(function(item, index, object){
		if (item.feature ) return;
		if (item.donation) SPEED = 6;
		if (item.x > WIDTH + 100) object.splice(index, 1);
	});
}

// animate everything - auto-  repeated
function animate(){
	requestID = requestAnimationFrame(animate);
	ctx.clearRect(0,0,WIDTH,HEIGHT);
	drawVehicles(txBitCoin);
	removeVehicles();
}

// hide signes on small screens
if(mobileCheck()) {
	//	$("input.overlay-switch")[0].checked = true;
		$( ".sign" ).fadeToggle( "slow", "linear" );
	}


function onReady(callback) {
    let intervalID = window.setInterval(checkReady, 1500);

    function checkReady() {
        if (document.getElementsByTagName('body')[0] !== undefined) {
            window.clearInterval(intervalID);
            callback.call(this);
        }
    }
}


init();
