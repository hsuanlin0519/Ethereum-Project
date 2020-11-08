const express = require('express');
const router = express.Router();
const Provider = require('@truffle/hdwallet-provider');
var Web3 = require('web3');
const infuraURL = 'https://ropsten.infura.io/v3/76b5cbba7f2946218de13d39cd617659';


var web3 = new Web3(infuraURL);
var privateKey = '';
var provider;

web3.eth.net.getId().then(console.log);

web3.eth.net.isListening().then((s) => {
	console.log('True');
}).catch((e) => {
	console.log('False');
})


const contract = require('../contract/Base.json');
const tokenContract = require('../contract/ProjectToken.json');

var Personal = require('web3-eth-personal');


var personal = new Personal(Personal.givenProvider);


const request = require('request')
const cheerio = require('cheerio')
const url = 'https://coinmarketcap.com/'
const urlcondition = 'tr.cmc-table-row td.cmc-table__cell.cmc-table__cell--sortable.cmc-table__cell--right.cmc-table__cell--sort-by__price'




/* GET home page. */
router.get('/', async function (req, res, next) {
	res.render('index')
});

function setKey(key) {
	privateKey = key;
	console.log(privateKey)
	provider = new Provider(privateKey, infuraURL);
	web3 = new Web3(provider);

	web3.eth.net.getId().then(console.log);
	web3.eth.net.isListening().then((s) => {
		console.log('True');
	}).catch((e) => {
		console.log('False');
	})
}

router.post('/login', async function (req, res, next) {
	k = req.body.privatekey;
	setKey(k);
	res.send({
		privatekey: k
	})
});


//login
router.get('/balance', async function (req, res, next) {
	let ethBalance = await web3.eth.getBalance(req.query.account)
	res.send({
		ethBalance: web3.utils.fromWei(ethBalance, 'ether')
	})
});

router.post('/unlock', function (req, res, next) {

	web3.eth.personal.unlockAccount(req.body.account, req.body.password, 60)
		.then(function (result) {
			res.send('true')
		})
		.catch(function (err) {
			res.send('false')
		})
});
//balance
router.get('/allBalance', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	let erc20 = new web3.eth.Contract(tokenContract.abi);
	bank.options.address = req.query.address;
	erc20.options.address = req.query.erc20Address;

	let ethBalance = await web3.eth.getBalance(req.query.account)
	let accountTokenBalance = await erc20.methods.balanceOf(req.query.account).call()
	let tokenBalance = await bank.methods.getBalance().call({from: req.query.account })


	res.send({
		ethBalance: web3.utils.fromWei(ethBalance, 'ether'),
		accountTokenBalance: web3.utils.fromWei(accountTokenBalance, 'ether'),
		tokenBalance: web3.utils.fromWei(tokenBalance, 'ether')
	})
});



router.post('/uploadProduct', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.body.address;


	let productnum = await bank.methods.currentProductNum().call();
	productnum = parseInt(productnum, 10) + 1;
	uploadproduct = await bank.methods.uploadProduct(req.body.info,req.body.name,req.body.ID, web3.utils.toWei(req.body.price, 'ether')).send({
		from: req.body.account,
		gas: 3400000
	})
		.on('receipt', function (receipt) {
			console.log(receipt)
			res.send({
				
				receipt: receipt,
				productnum: productnum

			});

		})
		.on('error', function (error) {
			res.send(error.toString());
		})
});
router.get('/currentProductNum', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.query.address;
	let productnum = await bank.methods.currentProductNum().call()

	res.send({
		productnum: productnum
	})
});


router.get('/products', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.query.address;
	let currentProdNum = await bank.methods.currentProductNum().call()
	let products = [];
	products = [];
	products.splice(0, products.length);
	for (i = 1; i <=currentProdNum; i++) {
		let pd = await bank.methods.getProductName(i).call()
		products.push(pd);
	}

	res.send(products);
	
});


router.get('/selectinfo', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.query.address;
	
	
	let prod_price = await bank.methods.getProductPrice(req.query.nowProduct).call()
	let prod_name = await bank.methods.getProductName(req.query.nowProduct).call()
	let sellerID = await bank.methods.getSellerID(req.query.nowProduct).call()
	let status = await bank.methods.getTradeStatus(req.query.nowProduct).call()

	res.send({
		status: status,
		prod_price: web3.utils.fromWei(prod_price, 'ether'),
		prod_name: prod_name,
		sellerID: sellerID
	})

});




router.get('/status', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.query.address;

	let status = await bank.methods.getTradeStatus(req.query.nowProduct).call()
	res.send({
		status: status
	})
});

//設定交易狀態
router.post('/setTradeStatus', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.body.address;

	let setVal=bank.methods.setTradeStatus(req.body.nowProduct, req.body.setValue).send({
		from: req.body.account,
		gas: 3400000
	})
		.on('receipt', function (receipt) {
			res.send(receipt);
		})
		.on('error', function (error) {
			res.send(error.toString());
		})

});

router.post('/setBuyerID', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.body.address;

	let setBuyID = bank.methods.setBuyerID(req.body.nowProduct, req.body.buyerid).send({
		from: req.body.account,
		gas: 3400000
	})
		.on('receipt', function (receipt) {
			res.send(receipt);
		})
		.on('error', function (error) {
			res.send(error.toString());
		})

});


router.get('/getBuyerId', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.query.address;
	let flag = 0;
	
	let seller = await bank.methods.returnSellerAddress(req.query.nowProduct).call()
	let buyerID = await bank.methods.getBuyerID(req.query.nowProduct).call()
	if (req.query.account == seller) {
		flag = 1;
	}
	res.send({
		seller: seller,
		account:req.query.account,
		buyerID: buyerID,
		flag:flag
	})
});



router.post('/buy', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	let erc20 = new web3.eth.Contract(tokenContract.abi);
	bank.options.address = req.body.address;
	erc20.options.address = req.body.erc20Address;


	let value = await bank.methods.getProductPrice(req.body.nowProduct).call();
	
	erc20.methods.approve(bank.options.address, web3.utils.toWei(value, 'ether')).send({
		from: req.body.account,
		gas: 340000
	})
	.on('receipt', function (receipt) {
		res.send(receipt);
	})
	.on('error', function (error) {
		res.send(error.toString());
	})

	bank.methods.Pay(req.body.nowProduct).send({
		from: req.body.account,
		gas: 340000
	})
	.on('receipt', function (receipt) {
			res.send(receipt);
		})
	.on('error', function (error) {
			res.send(error.toString());
	})
});

router.get('/successtrade', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	let erc20 = new web3.eth.Contract(tokenContract.abi);
	bank.options.address = req.query.address;
	erc20.options.address = req.query.erc20Address;
	let add1 = await bank.methods.returnSellerAddress(req.query.nowProduct).call()
	if (req.query.account != add1) {
		b1 = 0;
	}
	else { b1 = 1;}
	res.send({
		b1: b1,
		add: add1,
		acc: req.query.account
	})
});




//withdraw Token
router.post('/withdraw', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.body.address;
	let value = bank.methods.getProductPrice(req.body.nowProduct).call();
	let add2 = await bank.methods.returnBuyerAddress(req.body.nowProduct).call()
	if (req.body.account != add2) {
		b2 = 0;
	}
	else {
	b2 = 1;
	bank.methods.successTrade(req.body.nowProduct).send({
		from: req.body.account,
		gas: 3400000
	})
		.on('receipt', function (receipt) {
			res.send(receipt);
		})
		.on('error', function (error) {
			res.send(error.toString());
		})
	}
	res.send({
		b2: b2,
		add: add2,
		acc: req.body.account
	})


});


//refund Token
router.post('/refund', async function (req, res, next) {
	let bank = new web3.eth.Contract(contract.abi);
	bank.options.address = req.body.address;
	let value = bank.methods.getProductPrice(req.body.nowProduct).call();
	let add3 = await bank.methods.returnBuyerAddress(req.body.nowProduct).call()
	if (req.body.account != add3) {
		b3 = 0;
	}
	else {
		b3 = 1;

		bank.methods.failTrade(req.body.nowProduct).send({
			from: req.body.account,
			gas: 3400000
		})
			.on('receipt', function (receipt) {
				res.send(receipt);
			})
			.on('error', function (error) {
				res.send(error.toString());
			})
	}
	res.send({
		b3: b3,
		add: add3,
		acc: req.body.account
	})
});




function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = router;