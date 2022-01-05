let _loader = [];

jQuery(document).ready(function($) {
  let _conf = JSON.parse(window.localStorage.getItem("meConf"));

  if(_conf) {
    $('#managerTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/pve.png"></div><div id="pveBox" class="col col-sm-8"><small></small></div></div>`);
    loadData(_conf, 'player-stats');
    loadData(_conf, 'quests');
    loadSlp(_conf)
  } else {
    $('#loading').hide();
  }

  let currency = 'php';

  getEthPrice(currency);
  getAxsPrice(currency);
  getSlpPrice(currency);
  $('#convRON').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/ron.png"></div><div class="col col-sm-8"><small></small><span></span></div></div>`);

  $('#saveBtn').click(() => {
    if(validateScholar()) {
      var encryptedKey = CryptoJS.AES.encrypt($('#sKey').val(), "DT.yB9)<UL*xf8{x").toString();
      let _data = {}
      _data['eth'] = $('#sRonin').val();
      _data['key'] = encryptedKey;

      window.localStorage.setItem("meConf", JSON.stringify(_data));

      var yesterDate = new Date();
      yesterDate.setDate(yesterDate.getDate() - 1);
      let _yesterday = convertDateToUTC(yesterDate);
      let _ySlp = {};
      _ySlp[_yesterday] = {}
      _ySlp[_yesterday]['total'] = $('#ySlp').val();
      window.sessionStorage.setItem('meSlp', JSON.stringify(_ySlp));

      $('#sRonin').val('');
      $('#sPerc').val('');
      $('#addScholar').modal('hide');

      reLoad();
    }
  })

  $('#adscho').click(() => {
    $('#ySlp').val('');
    $('#sRonin').val('');
    $('#sPerc').val('');
  });

  function validateScholar() {
    let valid = true;
    if($('#ySlp').val().length == 0) {
      valid = false;
      $('#ySlp').addClass('b-invalid');
    } else {
      $('#ySlp').removeClass('b-invalid');
    }

    if($('#sRonin').val().length != 46) {
      valid = false;
      $('#sRonin').addClass('b-invalid');
    } else {
      $('#sRonin').removeClass('b-invalid');
    }

    if($('#sKey').val().length == 0) {
      valid = false;
      $('#sKey').addClass('b-invalid');
    } else {
      $('#sKey').removeClass('b-invalid');
    }
    return valid;
  }
})

function getEthPrice(currency) {
  let _res = 0;
  $.ajax({
    url: 'https://api.coingecko.com/api/v3/coins/ethereum'+'?'+minuteCache(),
    success: function(result) {
      let cryptData = {};
      cryptData['thumb'] = './img/ethereum.png';
      cryptData['current_price'] = result.market_data.current_price[currency];
      cryptData['price_change_percentage_24h'] = result.market_data.price_change_percentage_24h;
      cryptData['currency'] = currency;

      window.sessionStorage.setItem("getEthPrice", JSON.stringify(cryptData));
      setCryptoPrice('#convETH', cryptData);
    }
  });
}

function getAxsPrice(currency) {
  let _res = 0;
  $.ajax({
    url: 'https://api.coingecko.com/api/v3/coins/axie-infinity'+'?'+minuteCache(),
    success: function(result) {
      let cryptData = {};
      cryptData['thumb'] = './img/axie_infinity_logo.png';
      cryptData['current_price'] = result.market_data.current_price[currency];
      cryptData['price_change_percentage_24h'] = result.market_data.price_change_percentage_24h;
      cryptData['currency'] = currency;

      window.sessionStorage.setItem("getAxsPrice", JSON.stringify(cryptData));
      setCryptoPrice('#convAXS', cryptData);
    }
  });
}

function getSlpPrice(currency, data) {
  let _res = 0;
  $.ajax({
    url: 'https://api.coingecko.com/api/v3/coins/smooth-love-potion'+'?'+minuteCache(),
    success: function(result) {
      let cryptData = {};
      cryptData['thumb'] = './img/slp.png';
      cryptData['current_price'] = result.market_data.current_price[currency];
      cryptData['price_change_percentage_24h'] = result.market_data.price_change_percentage_24h;
      cryptData['currency'] = currency;

      window.sessionStorage.setItem("getSlpPrice", JSON.stringify(cryptData));
      setCryptoPrice('#convSLP', cryptData);
    }
  });
}

function setCryptoPrice(cryp, result) {
  let dollarUSLocale = Intl.NumberFormat('en-US', {maximumFractionDigits: 2});
  $(cryp).html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="${result['thumb']}"></div><div class="col col-sm-8"><small>${dollarUSLocale.format(result['current_price'])}&nbspPHP</small><span class="${result['price_change_percentage_24h'] > 0 ? 'text-success' : 'text-danger'}">${parseFloat(result['price_change_percentage_24h']).toFixed(2)}%</span></div></div>`);
}

function convertDateToUTC(date) {
  return (getDateUTC(date).getMonth()+1)+'/'+getDateUTC(date).getDate()+'/'+getDateUTC(date).getFullYear();
}

function getDateUTC(date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}

function minuteCache() {
  return (new Date()).getMinutes();
}

function loadData(i, url) {
  let xRonin = i.eth.replace("ronin:", "0x");
  let trimRonin = i.eth.replace("ronin:", "");
  var decryptedBytes = CryptoJS.AES.decrypt(i.key, "DT.yB9)<UL*xf8{x");
  var _key = decryptedBytes.toString(CryptoJS.enc.Utf8);

  _loader.push(1);
  $.ajax({
    url: 'https://game-api.skymavis.com/game-api/clients/'+xRonin+'/'+url,
    type: 'GET',
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer '+_key);
    },
    data: {},
    success: function (data) {
      if(url == 'player-stats') {
        let _energy = 'Pending';
        if(data.meta_data.max_energy) {
          _energy = data.player_stat.remaining_energy;
        }
        let _pveSLP = data.player_stat.pve_slp_gained_last_day;

        $('#unclaimedTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/energy-pl.png"></div><div class="col col-sm-8"><small>Energy</small><span class=${_energy == 'Pending' ? "text-danger" : ""}>${_energy}</span></div></div>`);
        $('#managerTotal #pveBox small').html(`PVE&nbsp:&nbsp${_pveSLP}&nbspslp`);
      }
      if(url == 'quests') {
        let _checkin = data.items[0].missions[0].is_completed ? 'Done' : 'Pending';
        let _pve = data.items[0].missions[1].is_completed ? 'Done' : 'Pending';
        let _pvp = data.items[0].missions[2].is_completed ? 'Done' : 'Pending';
        let _pvpProg = data.items[0].missions[2].progress;
        let _claimed = data.items[0].claimed ? 'Done' : 'Pending';

        $('#pveBox').append(`<span class="${_pve == 'Pending' ? "text-danger" : "text-success"}">${_pve}</span>`);
        $('#claimedTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/checked.png"></div><div class="col col-sm-8"><small>Check In</small><span class=${_checkin == 'Pending' ? "text-danger" : "text-success"}>${_checkin}</span></div></div>`);
        $('#scholarTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/pvp.png"></div><div class="col col-sm-8"><small>PVP&nbsp:&nbsp${_pvpProg}&nbspwin</small><span class="${_pvp == 'Pending' ? "text-danger" : "text-success"}">${_pvp}</span></div></div>`);
        $('#averageTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/claim.png"></div><div class="col col-sm-8"><small>Claimed</small><span class=${_claimed == 'Pending' ? "text-danger" : "text-success"}>${_claimed}</span></div></div>`);
      }
    },
    error: function (err) {
      if(err.responseJSON.error_type == 'INTERNAL_SERVER_ERROR') {
        setTimeout(function () {
          loadData(i, url);
        }, 5000);
      }
    },
    complete: function () {
      _loader.pop();
      if(_loader.length == 0) {
        $('#loading').hide();
      }
    }
  });
}

function loadSlp(i) {
  let _now = convertDateToUTC(new Date());
  var yesterDate = new Date();
  yesterDate.setDate(yesterDate.getDate() - 1);
  let _yesterday = convertDateToUTC(yesterDate);
  let slpNow = 0;

  $.ajax({
    url: 'https://game-api.skymavis.com/game-api/clients/'+i.eth.replace("ronin:", "0x")+'/items/1',
    cache: false,
    success: function(res) {
      if(res.success) {
        let _data = JSON.parse(window.sessionStorage.getItem('meSlp'));
        console.log(_data);
        if(_data == null) _data = {};
        console.log(_data);
        if(_data[_now] == null) {
          let temp = 0;
          if(_data[_yesterday] && _data[_yesterday]['total']) {
            temp = _data[_yesterday]['total'];
          }
          console.log(temp);
          _data = {};
          _data[_now] = {};
          _data[_yesterday] = {};
          _data[_yesterday]['total'] = temp;
        }

        _data[_now]['total'] = res.total;
        if(_data[_yesterday] && _data[_yesterday]['total']) {
          slpNow = _data[_now]['total'] - _data[_yesterday]['total'];
        }
        window.sessionStorage.setItem('meSlp', JSON.stringify(_data));
        $('#overAllTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/slp.png"></div><div class="col col-sm-8"><small>SLP Today</small><span>${slpNow}</span></div></div>`);
      }
    },
    error: function(e) {
      setTimeout(function () {
        loadSlp(i);
      }, 5000);
    }
  });
}

function reLoad() {
  window.location.reload();
  $('#loading').show();
}

var pStart = { x: 0, y: 0 };
var pStop = { x: 0, y: 0 };

function swipeStart(e) {
  if (typeof e["targetTouches"] !== "undefined") {
    var touch = e.targetTouches[0];
    pStart.x = touch.screenX;
    pStart.y = touch.screenY;
  } else {
    pStart.x = e.screenX;
    pStart.y = e.screenY;
  }
}

function swipeEnd(e) {
  if (typeof e["changedTouches"] !== "undefined") {
    var touch = e.changedTouches[0];
    pStop.x = touch.screenX;
    pStop.y = touch.screenY;
  } else {
    pStop.x = e.screenX;
    pStop.y = e.screenY;
  }

  swipeCheck();
}

function swipeCheck() {
  var changeY = pStart.y - pStop.y;
  var changeX = pStart.x - pStop.x;
  if (isPullDown(changeY, changeX)) {
    reLoad();
  }
}

function isPullDown(dY, dX) {
  // methods of checking slope, length, direction of line created by swipe action
  return (
    dY < 0 &&
    ((Math.abs(dX) <= 100 && Math.abs(dY) >= 300) ||
      (Math.abs(dX) / Math.abs(dY) <= 0.3 && dY >= 60))
  );
}

document.addEventListener(
  "touchstart",
  function (e) {
    swipeStart(e);
  },
  false
);
document.addEventListener(
  "touchend",
  function (e) {
    swipeEnd(e);
  },
  false
);
