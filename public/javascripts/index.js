'use strict'


let contractAddress = $('#contractAddress');
let loginaccount = $('#loginaccount');
let loginpassword = $('#loginpassword');
let login = $('#login');
let logout = $('#logout');
let update = $('#update');
let logger = $('#logger');
let withdrawButton = $('#withdrawButton');
let refundButton = $('#refundButton');

let insertproductName = $('#insertproductName');
let insertPrice = $('#insertPrice');
let insertID = $('#insertID');
let insertproductInfo = $('#insertproductInfo');
let upload = $('#upload');
let buyerID = $('#buyerID');
let allproducts = $('#allproducts');
let selectinfo = $('#selectinfo');
let buy = $('#buy');
let uploadstatus = $('#uploadstatus');
let productName = $('#productName');
let productPrice = $('#productPrice');
let sellerID = $('#sellerID');
let updatestatus = $('#updatestatus');
let mainpage = $('#mainpage');
let loginpage = $('#loginpage');
let uploadpage = $('#uploadpage');
let successtradeButton = $('#successtradeButton');

let erc20Address = '0xa35408ea2403eE7f923b1Ca7E3d5cB816fC95A62';
let bankAddress = '0x6B200b30371a1fd45121eb5608dBec3619572bEb';


let nowAccount = "";
let privatekey = "";
let name = "";
let info = "";
let price = "";
let ID = "";
let nowProduct = "";
let nowProd = "";
let prod_num = "";
var i = 0;
let save_status = [];
var option_val = '0';
var option_val2 = '0';
var close_flag = 0;


function log(...inputs) {
	for (let input of inputs) {
		if (typeof input === 'object') {
			input = JSON.stringify(input, null, 2)
		}
		logger.html(input + '\n' + logger.html())
	}
}



// 當按下登入按鍵時

login.on('click', async function () {

	$.post('/login', {
		name:loginaccount.val(),
		privatekey: loginpassword.val()
	}, function (result) {
		    //update.trigger('click')
			log(result.privatekey, 'pk')
	})
	
	window.location.href = "index.html";


	//$.get('/getSessionAccount', {
	//})


})


logout.on('click', async function () {

	$.get('/logout', {
	}, function (result) {
		alert('您已登出,將重新導向首頁');

	})

	//window.location.href = "index.html";
})



//首頁按鍵
mainpage.on('click', async function () {
	
	window.location.href = "index.html";
	
})

//我要上架商品
uploadpage.on('click', async function () {
	close_flag = 1;
	window.location.href = "./uploadpage.html";
})

// 我要登入按鍵
loginpage.on('click', async function () {
	
	window.location.href = "./loginpage.html";
})

//當開啟首頁
window.onload = function () {
	
	if (window.location.pathname == "/index.html") {
		/*$.get('/getSessionAccount', {
		}, function (result) {
				if (result.nowAcc != "") {
					$('#nowAcc').text('現在登入帳號： ' + result.nowAcc)
				}
		})*/

		$.get('/currentProductNum', {
			address: bankAddress
		}, function (result) {
			option_val = result.productnum;
			log({
				productnum: result.productnum,
				option_val: option_val
			})

		})



		$.get('/products', {
			//info: "",
			address: bankAddress,
		},

			function (products) {
				option_val = '0';
				for (let product of products) {
					option_val++;
					allproducts.append(`<option value = "${option_val}">${product}</option>`)
					log(option_val, '編號')
				}

			})

	}
};

//當關閉首頁
window.onunload = function () {
	

}





// 當按下更新按鍵時
update.on('click', function () {
	if (bankAddress != "") {
		$.get('/allBalance', {
			address: bankAddress,
			erc20Address: erc20Address,
		}, function (result) {
			if (result.login == 1) {
				window.location.href = "./loginpage.html"
			}
			else {
				log({

					ethBalance: result.ethBalance,
					tokenBalance: result.tokenBalance
				})
				log('更新帳戶資料')

				$('#ethBalance').text('以太帳戶餘額 (ETH): ' + result.ethBalance)
				$('#accountTokenBalance').text('Token帳戶餘額： ' + result.accountTokenBalance)

			}
		})
	}
})


upload.on('click', function () {
	if (bankAddress != '') {
		$.post('/uploadProduct', {
			address: bankAddress,
			erc20Address: erc20Address,
			info: insertproductInfo.val(),
			name: insertproductName.val(),
			price: parseInt(insertPrice.val(), 10),
			ID: insertID.val()
		}, function (result) {
				if (result.login == 1) {
					window.location.href = "./loginpage.html"
				}
				else {
				alert('上架成功,您的商品編號是' + result.productnum)
					window.location.href = "index.html";
				}
		})
		

	
	}
	
})



selectinfo.on('click', function () {
	if (bankAddress != "") {
		$.get('/selectinfo', {
			address: bankAddress,
			erc20Address: erc20Address,
			nowProduct: parseInt(allproducts.val(),10)
		}, function (result) {
				tradeStatus(result.status)
				$('#productPrice').text('商品價格: ' + result.prod_price)
				$('#sellerID').text('賣家遊戲ID: ' + result.sellerID)
				$('#productName').text('商品資訊: ' + result.prod_info)
		})
	}
})



	








updatestatus.on('click', function () {
	$.get('/status', {
		address: bankAddress,
		nowProduct: parseInt(allproducts.val(), 10)
	}, function (result) {
		tradeStatus(result.status)
	})
})




function waitTransactionStatus() {
	$('#accountStatus').html('帳戶狀態 <b style="color: blue">(等待交易驗證中...)</b>')
}

function doneTransactionStatus() {
	$('#accountStatus').text('帳戶狀態')
}

function setTradeStatus(inp1,inp2) {
	$.post('/setTradeStatus', {
		address: bankAddress,
		erc20Address: erc20Address,
		nowProduct: parseInt(inp1, 10),
		setValue: parseInt(inp2, 10)
	}, function (result) {
			if (result.login == 1) {
				window.location.href = "./loginpage.html"
			}
			else {
				update.trigger('click');
			}
	})
}
function tradeStatus(inp) {
	if (inp == 1) {
		$('#tradeStatus').html('交易狀態: ' + '買家已下單,請至遊戲內交易')
	}
	else if (inp == 2) {
		$('#tradeStatus').html('交易狀態: ' + '商品移交中,等待買家領收')
	}
	else if (inp == 3) {
		$('#tradeStatus').html('交易狀態: ' + '商品領收完畢,系統已儲存交易紀錄')
	}
	else if (inp == 4) {
		$('#tradeStatus').html('交易狀態: ' + '交易申請取消中')
	}
	else {
		$('#tradeStatus').html('交易狀態: ')
	}
}



function distributeERC20(erc20Address) {
	$.post('/distributeERC20', {
		erc20Address: erc20Address
	}, function (result) {
		console.log(erc20Address);
	})
}

async function unlockAccount() {
	let password = prompt("請輸入你的密碼", "");
	if (password == null) {
		return false;
	}
	else {
		return $.post('/unlock', {
			password: password
		})
			.then(function (result) {
				if (result == 'true') {
					return true;
				}
				else {
					alert("密碼錯誤")
					return false;
				}
			})
	}
}

//下單後賣家查看買家遊戲ID
buyerID.on('click', async function () {
	$.get('/status', {
		address: bankAddress,
		nowProduct: parseInt(allproducts.val(), 10)
	}, function (result) {
			if (result.status != 1) {
				alert("目前還不能查看買家ID")
				return;
			}
			else {
				$.get('/getBuyerId', {
					address: bankAddress,
					account: nowAccount,
					nowProduct: parseInt(allproducts.val(), 10)
				}, function (result) {
					if (result.flag == 1) {
						alert("買家遊戲ID是:" + result.buyerID + "(請務必紀錄)")
					}
					else alert("您不是本商品賣家,無法查看買家ID")
				})
			}
	})
	
})

buy.on('click', async function () {

	//確認商品可被下單
	$.get('/status', {
		address: bankAddress,
		nowProduct: parseInt(allproducts.val(), 10)
	}, function (result) {
			if (result.status > 0) {
				$('#tradeStatus').html('此商品已售完')
				return;
			}
			else {
				waitTransactionStatus();
				
				$.post('/buy', {
					address: bankAddress,
					erc20Address: erc20Address,
					nowProduct: parseInt(allproducts.val(), 10)
				}, function (result) {
					if (result.login == 1) {
						window.location.href = "./loginpage.html"
					}
					else {
					update.trigger('click')
					// 完成下單 買家輸入ID
					let buyerid = prompt('請輸入您的遊戲ID: ', '在此輸入ID');
					$.post('/setBuyerID', {
						address: bankAddress,
						erc20Address: erc20Address,
						nowProduct: parseInt(allproducts.val(), 10),
						buyerid: buyerid
					})


					}
				})
				

			}
	})

})

successtradeButton.on('click', async function () {

	if (bankAddress == "") {
		return;
	}
	
	$.get('/status', {
		address: bankAddress,
		nowProduct: parseInt(allproducts.val(), 10)
	}, function (result) {
			if (result.status != 1) {
				$('#tradeStatus').html('交易狀態: 此商品尚未被下單')
				return;
			}
			else {
				$.get('/successtrade', {
					address: bankAddress,
					erc20Address: erc20Address,
					nowProduct: parseInt(allproducts.val(), 10)
				}, function (result) {
						if (result.login == 1) {
							window.location.href = "./loginpage.html"
						}
						else {
							if (result.b1 == 1) {
								var sure = confirm('您確定已移交商品並願意負起法律責任嗎?');
								if (sure) {
									alert('您已移交商品,請通知買家領收');
									setTradeStatus(parseInt(allproducts.val(), 10), parseInt('2', 10))
									updatestatus.trigger('click')
								}
								else {
									alert('取消');
								}
							}
							else { alert('您不是此商品賣家'); }
						}
				})
			}
				
		})
	})





withdrawButton.on('click', async function () {
	if (bankAddress == "") {
		return;
	}
	$.get('/status', {
		address: bankAddress,
		nowProduct: parseInt(allproducts.val(), 10)
	}, function (result) {
			if (result.status != 2) {
				$('#tradeStatus').html('交易狀態: 賣家尚未移交商品')
				return;
			}
			else {
				waitTransactionStatus()
				// 提款
				$.post('/withdraw', {
					address: bankAddress,
					nowProduct: parseInt(allproducts.val(), 10)
				}, function (result) {
					if (result.login == 1) {
						window.location.href = "./loginpage.html"
					}
					else {
						if (result.b2 == 1) {
							var sure = confirm('您確定已收到商品?領收後款項即支付給賣家');
							if (sure) {
								alert('您已完成領收,系統即將支付款項予賣家');
								updatestatus.trigger('click')
							}
							else {
								alert('取消');
							}
						}
						else { alert('您不是此商品買家'); }
					}
				})

			}
		
	})	
})


refundButton.on('click', function () {

	if (bankAddress == "") {
		return;
	}
	
	// 更新介面
	waitTransactionStatus()
	// 提款
	$.post('/refund', {
		address: bankAddress,
		nowProduct: parseInt(allproducts.val(), 10)
	}, function (result) {

			if (result.b3 == 1) {
				var sure = confirm('您確定要取消交易並申請退款,且負起法律責任嗎?');
				if (sure) {
					alert('您已申請退款,請等待系統回應');
					updatestatus.trigger('click')
					// 觸發更新帳戶資料
					update.trigger('click')
					// 更新介面 
					doneTransactionStatus()
				}
				else {
					alert('取消');
				}
			}
			else { alert('您不是此商品買家'); }

	})
})
	
