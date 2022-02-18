let _loader = [];
let _loader2 = [];

const RONIN_PROVIDER = 'https://api.roninchain.com/rpc';
const SLP_CONTRACT = '0xa8754b9fa15fc18bb59458815510e40a12cd2014';
const BALANCE_ABI = [
    {
      "constant": true,
      "inputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "name": "balanceOf",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
]
var web3 = new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER));

jQuery(document).ready(function($) {
  let _config = JSON.parse(window.localStorage.getItem("config"));

  if(_config != null) {
    for (var i in _config) {
      displayRow(_config[i]);
      setDefaultLeaderboard(_config[i]);
    }
    for (var i in _config) {
      loadScholar(_config[i]);
      loadRoninSLP(_config[i]);
      if(_config[i].key) {
        loadData(_config[i], 'player-stats');
      }
    }
    for (var i in _config) {
      schoLeaderboard(_config[i]);
    }
    setTimeout(function(){ $('#loading').hide(); }, 2000);
  } else {
    $('#loading').hide();
  }

  $('#saveBtn').click(() => {
    if(validateScholar()) {
      let _conf = JSON.parse(window.localStorage.getItem("config"));
      if(_conf == null) {
        _conf = {}
      }

      let _data = {}
      var encryptedKey = CryptoJS.AES.encrypt($('#sKey').val(), "gj*d%uV@zJpiFCsG").toString();
      _data['name'] = $('#sName').val();
      _data['eth'] = $('#sRonin').val();
      _data['managerShare'] = $('#sPerc').val();
      _data['key'] = encryptedKey;

      let trimRonin = $('#sRonin').val().replace("ronin:", "");

      _conf[trimRonin] = _data;
      loadScholar(_data);
      loadRoninSLP(_data);
      window.localStorage.setItem("config", JSON.stringify(_conf));

      let _storedSlp = JSON.parse(window.localStorage.getItem("storedSlp"));
      let _ySlp = parseInt($('#ySLP').val());
      let _ytSlp = _ySlp;
      let _2Db4Slp = 0;

      if(_storedSlp) {
        var yesterDate = new Date();
        yesterDate.setDate(yesterDate.getDate() - 1);
        let _yesterday = convertDateToUTC(yesterDate);

        let _slp = 0;
        if(_storedSlp[trimRonin] && _storedSlp[trimRonin][_yesterday] && _storedSlp[trimRonin][_yesterday]['slp']) {
          var twoDb4 = new Date();
          twoDb4.setDate(twoDb4.getDate() - 2);
          let _twoDb4 = convertDateToUTC(twoDb4);
          if(_storedSlp[trimRonin][_twoDb4] && _storedSlp[trimRonin][_twoDb4]['slp']) {
            _2Db4Slp = _storedSlp[trimRonin][_twoDb4]['slp'];
            _ytSlp = _2Db4Slp + _ySlp;
          }
        }

        if(_storedSlp[trimRonin] == null) {
          _storedSlp[trimRonin] = {};
          if(_storedSlp[trimRonin][_yesterday] == null) {
            _storedSlp[trimRonin][_yesterday] = {};
          }
        }

        var now = new Date();
        let _now = convertDateToUTC(now);

        _storedSlp[trimRonin][_now]['currSlp'] = _storedSlp[trimRonin][_now]['slp'] - _ytSlp;
        _storedSlp[trimRonin][_yesterday]['slp'] = _ytSlp;
        _storedSlp[trimRonin][_yesterday]['currSlp'] = _ySlp;
        window.localStorage.setItem("storedSlp", JSON.stringify(_storedSlp));
      }

      $('#sName').val('');
      $('#sRonin').val('');
      $('#sPerc').val('');
      $('#ySLP').val('');
      $('#sKey').val('');
      $('#addScholar').modal('hide');
    }
  })

  function setDefaultLeaderboard(i) {
    let trimRonin = i.eth.replace("ronin:", "");
    let _data = JSON.parse(window.sessionStorage.getItem(trimRonin));
    let _now = convertDateToUTC(new Date());
    let _storedSlp = JSON.parse(window.localStorage.getItem("storedSlp"));
    if(_data != null) {
      let _bmc = 0
      if(_storedSlp[trimRonin][_now] != null) {
        _bmc = _storedSlp[trimRonin][_now]['bmc'];
      }
      $('#'+trimRonin+' .schoMmr').html(`<span>${_data['mmr'] != undefined ? _data['mmr'] : 0}</span>`);
      // $('#'+trimRonin+' .schoWin').html(`<span>${_bmc != undefined ? _bmc : 0}</span>`);
    }
  }

  $('#adscho').click(() => {
    $('#sName').val('');
    $('#sRonin').val('');
    $('#sPerc').val('');
  });

  function validateScholar() {
    let valid = true;
    if($('#sName').val().length < 3) {
      valid = false;
      $('#sName').addClass('b-invalid');
    } else {
      $('#sName').removeClass('b-invalid');
    }

    if($('#sRonin').val().length != 46) {
      valid = false;
      $('#sRonin').addClass('b-invalid');
    } else {
      $('#sRonin').removeClass('b-invalid');
    }

    if($('#sPerc').val().length == 0 || $('#sPerc').val().length > 3 || $('#sPerc').val() > 100) {
      valid = false;
      $('#sPerc').addClass('b-invalid');
    } else {
      $('#sPerc').removeClass('b-invalid');
    }

    if($('#sKey').val().length == 0) {
      valid = false;
      $('#sKey').addClass('b-invalid');
    } else {
      $('#sKey').removeClass('b-invalid');
    }
    return valid;
  }

  setImportData('config');
  setImportData('storedSlp');

  $('#isLink').click(() => {
    $('.edit-cont').hide();
    $('.reload-cont').show();
    $('.battle-cont').hide();
  })

  $('#isManage').click(() => {
    $('.edit-cont').show();
    $('.reload-cont').hide();
    $('.battle-cont').hide();
  })

  $('#isBattle').click(() => {
    $('.edit-cont').hide();
    $('.reload-cont').hide();
    $('.battle-cont').show();
  })

  // let time = new Date(Date.now()).getUTCMinutes();
  // if(time < 58) {
  //   reloadWhen = 58 - time;
  //   setTimeout(function () {
  //     reLoad();
  //   }, reloadWhen * 60000);
  // }
})

function loadScholar(i) {
  let trimRonin = i.eth.replace("ronin:", "");
  _loader.push(1);
  $.ajax({
    url: 'https://game-api.skymavis.com/game-api/clients/'+i.eth.replace("ronin:", "0x")+'/items/1',
    cache: false,
    success: function(result2) {
      if(result2.success) {
        let _data = JSON.parse(window.sessionStorage.getItem(trimRonin));
        if(_data == null) _data = {};
        _data['last_claimed'] = result2.last_claimed_item_at;
        _data['total'] = result2.total;
        _data['claimable_total'] = result2.claimable_total;
        window.sessionStorage.setItem(trimRonin, JSON.stringify(_data));

        setRowSLPData(_data, i, trimRonin);
        scholarDetails(_data, i);
      }
      _loader.pop();
      if(_loader.length == 0) {
        setAllData();
        $('#loading').hide();
      }
    },
    error: function(e) {
      _loader.pop();
      let _data = JSON.parse(window.sessionStorage.getItem(trimRonin));
      if(_data != null) {
        setRowSLPData(_data, i, trimRonin);
      }
      if(_loader.length == 0) {
        setAllData();
        $('#loading').hide();
      }
      setTimeout(function(){
        loadScholar(i)
      }, 10000);
    }
  });
}

function schoLeaderboard(i) {
  let trimRonin = i.eth.replace("ronin:", "");
  setTimeout(function(){
    $.ajax({
      url: 'https://game-api.skymavis.com/game-api/leaderboard?client_id='+i.eth.replace("ronin:", "0x")+'&limit=0',
      // cache: false,
      success: function(result) {
        if(result.success) {
          let _data = JSON.parse(window.sessionStorage.getItem(trimRonin));
          if(_data == null) _data = {};
          _data['mmr'] = result.items[1].elo;
          // let _lose = result.items[1].draw_total + result.items[1].lose_total;
          // if(_lose == 0) {
          //   _data['win_rate'] = 0;
          // } else {
          //   _data['win_rate'] = result.items[1].win_total / _lose;
          // }
          window.sessionStorage.setItem(trimRonin, JSON.stringify(_data));

          $('#'+trimRonin+' .schoMmr').html(`<span>${_data['mmr']}</span>`);
          // $('#'+trimRonin+' .schoWin').html(`<span>${_data['win_rate']}</span>%`);
        }
        jQuery('#'+trimRonin).find('.bi-arrow-clockwise').removeClass('icn-spinner');
      },
      error: function(e) {
        let _data = JSON.parse(window.sessionStorage.getItem(trimRonin));
        if(_data != null) {
          $('#'+trimRonin+' .schoMmr').html(`<span>${_data['mmr'] != undefined ? _data['mmr'] : 0}</span>`);
          // $('#'+trimRonin+' .schoWin').html(`<span>${_data['win_rate'] != undefined ? _data['win_rate'] : 0}</span>%`);
        }
        jQuery('#'+trimRonin).find('.bi-arrow-clockwise').removeClass('icn-spinner');
      }
    });
  }, 10000);
}

function setRowSLPData(_data, i, trimRonin) {
  let _now = convertDateToUTC(new Date());
  let _lastClaim = (Date.now() - (_data['last_claimed'] * 1000)) / (1000 * 60 *60 *24);
  let _unclaimed = _data['total'] - _data['claimable_total'];
  let _currSlp = storeSlp(trimRonin, _unclaimed, Math.ceil(_lastClaim));
  let _storedSlp = JSON.parse(window.localStorage.getItem("storedSlp"));
  let _lastCal = _storedSlp[trimRonin][_now]['day']-1;

  var yesterDate = new Date();
  yesterDate.setDate(yesterDate.getDate() - 1);
  let _yesterday = convertDateToUTC(yesterDate);

  let _yesterdaySlp = 0;
  if(_storedSlp[trimRonin][_yesterday]) {
    _yesterdaySlp = _storedSlp[trimRonin][_yesterday]['currSlp'];
  }

  let _avg = _lastCal <= 0 ? _currSlp : Math.round((_unclaimed - _currSlp) / _lastCal);
  let _nxtClaim = new Date(_data['last_claimed'] * 1000);
  let _managerSLP = parseFloat(_unclaimed) * i.managerShare / 100;
  let _scholarSLP = parseFloat(_unclaimed) * (100 - i.managerShare) / 100;
  _nxtClaim.setDate(_nxtClaim.getDate() + 14);

  let _getSlpPrice = JSON.parse(window.sessionStorage.getItem("getSlpPrice"));
  let dollarUSLocale = Intl.NumberFormat('en-US', {maximumFractionDigits: 0});

  $('#'+trimRonin+' .schoAVG').html(`<span class=${_avg <= 50 ? "b-danger" : _avg < 75 ? "b-warning" : "b-success"}>${_avg}</span>`);
  $('#'+trimRonin+' .schoToday').html(`<span class=${_currSlp <= 50 ? "b-danger" : _currSlp < 75 ? "b-warning" : "b-success"}>${_currSlp}</span>`);
  $('#'+trimRonin+' .schoYesterday').html(`<span class=${_yesterdaySlp <= 50 ? "b-danger" : _yesterdaySlp < 75 ? "b-warning" : "b-success"}>${_yesterdaySlp}</span>`);
  // $('#'+trimRonin+' .schoWin').html(`<span>${_storedSlp[trimRonin][_now]['bmc']}</span>`);
  $('#'+trimRonin+' .schoLast').html(`${_lastClaim > 1000 ? '<span>0</span>' : ('<span>'+Math.round(_lastClaim)+'</span>')+' days'}`);
  $('#'+trimRonin+' .schoNext').html(`<div class=${Math.round(_lastClaim) < 14 ? "b-warning" : "b-success"}>${_lastClaim > 1000 ? '<span>Now</span>' : (14 - Math.round(_lastClaim)) <= 0 ? '<span>Now</span>' :'In <span>'+(14 - Math.round(_lastClaim))+'</span> days'} <br><small>${_nxtClaim.toLocaleDateString().replaceAll('/','-') + ' ' + (_nxtClaim.getHours() > 12 ? (_nxtClaim.getHours() - 12) + ':' + (_nxtClaim.getMinutes() < 10 ? '0'+_nxtClaim.getMinutes() : _nxtClaim.getMinutes()) + ' PM' : _nxtClaim.getHours() + ':' + (_nxtClaim.getMinutes() < 10 ? '0'+_nxtClaim.getMinutes() : _nxtClaim.getMinutes()) + ' AM')}</small></div>`);
  $('#'+trimRonin+' .schoUnclaim').html(`<span>${dollarUSLocale.format(_unclaimed)}</span>${_getSlpPrice != null ? ('<br><small>'+ dollarUSLocale.format(_unclaimed * _getSlpPrice['current_price'])+ ' ' +_getSlpPrice['currency'].toUpperCase()+'</small>') : ''}`);
  $('#'+trimRonin+' .schoRonin').html(`<span>${dollarUSLocale.format(_data['claimable_total'])}</span>${_getSlpPrice != null ? ('<br><small>'+ dollarUSLocale.format(_data['claimable_total'] * _getSlpPrice['current_price'])+ ' ' +_getSlpPrice['currency'].toUpperCase()+'</small>') : ''}`);
  $('#'+trimRonin+' .schoSLP').html(`<span>${dollarUSLocale.format(_scholarSLP)}</span>${_getSlpPrice != null ? ('<br><small>'+ dollarUSLocale.format(_scholarSLP * _getSlpPrice['current_price'])+ ' ' +_getSlpPrice['currency'].toUpperCase()+'</small>') : ''}`);
  $('#'+trimRonin+' .schoManager').html(`<span>${dollarUSLocale.format(_managerSLP)}</span>${_getSlpPrice != null ? ('<br><small>'+ dollarUSLocale.format(_managerSLP * _getSlpPrice['current_price'])+ ' ' +_getSlpPrice['currency'].toUpperCase()+'</small>') : ''}`);
  $('#'+trimRonin+' .schoTotal').html(`<span>${dollarUSLocale.format(_data['total'])}</span>${_getSlpPrice != null ? ('<br><small>'+ dollarUSLocale.format(_data['total'] * _getSlpPrice['current_price'])+ ' ' +_getSlpPrice['currency'].toUpperCase()+'</small>') : ''}`);
}

function reloadScholar(r) {
  let _conf = JSON.parse(window.localStorage.getItem("config"));
  if(_conf != null) {
    jQuery('#'+_conf[r].eth.replace("ronin:", "")).find('.bi-arrow-clockwise').addClass('icn-spinner');
    loadScholar(_conf[r]);
    loadRoninSLP(_conf[r]);
    schoLeaderboard(_conf[r]);
  }
}

function loadRoninSLP(i) {
  _loader2.push(1);
  var ctr = new web3.eth.Contract(BALANCE_ABI, SLP_CONTRACT);
  let trimRonin = i.eth.replace("ronin:", "");
  ctr.methods.balanceOf(
    web3.utils.toChecksumAddress(i.eth.replace("ronin:", "0x"))
  ).call()
  .then(ret => {
    let _data = JSON.parse(window.sessionStorage.getItem(trimRonin));
    let _getSlpPrice = JSON.parse(window.sessionStorage.getItem("getSlpPrice"));
    if(_data == null) _data = {};
    if(!_data['total']) _data['total'] = 0;
    if(!_data['claimable_total']) _data['claimable_total'] = 0;
    let roninSLP = parseInt(ret);

    let _unclaimed = _data['total'] - _data['claimable_total'];
    let _total = _unclaimed + roninSLP;
    _data['ronin_slp'] = roninSLP;
    _data['new_total'] = _total;
    window.sessionStorage.setItem(trimRonin, JSON.stringify(_data));

    _loader2.pop();
    if(_loader2.length == 0) {
      window.sessionStorage.setItem('sessionLoaded', 'yes');
      $('#loading').hide();
    }
  });
}

function loadData(i, url) {
  let xRonin = i.eth.replace("ronin:", "0x");
  let trimRonin = i.eth.replace("ronin:", "");
  var decryptedBytes = CryptoJS.AES.decrypt(i.key, "gj*d%uV@zJpiFCsG");
  var _key = decryptedBytes.toString(CryptoJS.enc.Utf8);
  let _now = convertDateToUTC(new Date());
  let _cached = JSON.parse(window.localStorage.getItem(trimRonin));

  if(_cached == null) _cached = {};
  if(_cached[_now] == null) {
    _cached[_now] = {};
    window.localStorage.removeItem(trimRonin);
  }

  if(!(_cached[_now]['energy'] && _cached[_now]['claim'])) {
    $.ajax({
    url: 'https://game-api.skymavis.com/game-api/clients/'+xRonin+'/'+url,
    type: 'GET',
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer '+_key);
    },
    data: {},
    success: function (data) {
      if(url == 'player-stats') {
        let _energy = 'XX';
        _cached[_now]['energy'] = 0;
        if(data.meta_data.max_energy) {
          _energy = toDoubleDigit(data.player_stat.remaining_energy);
          if(data.player_stat.remaining_energy == 0) {
            _cached[_now]['energy'] = 1;
          }
        }
        window.localStorage.setItem(trimRonin, JSON.stringify(_cached));

        $('#'+trimRonin+' .schoNGY').html(`<span class=${_energy == 'XX' ? "b-danger" : _energy == '00' ? "b-success" : "b-warning"}>${_energy}</span>`);
      }
    },
    error: function (err) {
      if(err.responseJSON.error_type == 'INTERNAL_SERVER_ERROR') {
        setTimeout(function () {
          loadData(i, url);
        }, 5000);
      }
    }
    });
  } else {
    $('#'+trimRonin+' .schoNGY').html(`<span>Y</span>`);
  }
}

function scholarDetails(data, i) {
  let _overAllData = JSON.parse(window.sessionStorage.getItem("overAllData"));
  let _now = convertDateToUTC(new Date());
  let trimRonin = i.eth.replace("ronin:", "");
  let _lastClaim = (Date.now() - (data['last_claimed'] * 1000)) / (1000 * 60 *60 *24);
  let _unclaimed = data['total'] - data['claimable_total'];
  let _currSlp = storeSlp(trimRonin, _unclaimed, Math.ceil(_lastClaim));

  let _storedSlp = JSON.parse(window.localStorage.getItem("storedSlp"));
  let _lastCal = _storedSlp[trimRonin][_now]['day']-1;
  if(_lastCal <= 0) _lastCal = 1;
  let _avg = _lastCal == 1 ? _currSlp : Math.round((_unclaimed - _currSlp) / _lastCal);
  let _managerSLP = parseFloat(_unclaimed) * i.managerShare / 100;
  let _scholarSLP = parseFloat(_unclaimed) * (100 - i.managerShare) / 100;

  if(_overAllData == null) {
    _overAllData = {}
  }
  if(_overAllData[trimRonin] == null) {
    _overAllData[trimRonin] = {}
  }
  if(_overAllData[trimRonin][_now] == null) {
    _overAllData[trimRonin][_now] = {}
  }

  _overAllData[trimRonin][_now]['avg'] = _avg;
  _overAllData[trimRonin][_now]['managerSLP'] = _managerSLP;
  _overAllData[trimRonin][_now]['scholarSLP'] = _scholarSLP;
  _overAllData[trimRonin][_now]['roninSLP'] = data['ronin_slp'];

  window.sessionStorage.setItem("overAllData", JSON.stringify(_overAllData));
}

function displayRow(i) {
  let trimRonin = i.eth.replace("ronin:", "");

  $('#detail').append(`<tr id="${trimRonin}">
    <td class="edit-cont" style="display: none;"><a onclick="editScholar('${trimRonin}')" class="text-primary"><span class="bi bi-pencil-square"></span></a></td>
    <td class="reload-cont"><a href="https://marketplace.axieinfinity.com/profile/${i.eth}/axie/" target="_blank" class="text-primary"><span class="bi bi-link-45deg"></span></a></td>
    <td class="battle-cont" style="display: none;"><a href="https://axie-now.rf.gd/redirect.php/?player=0x${trimRonin}" target="_blank" class="text-primary"><span class="bi bi-joystick"></span></a></td>
    <td><span>${i.name}</span></td>
    <td class="schoNGY"></td>
    <td class="schoAVG"></td>
    <td class="schoToday"></td>
    <td class="schoYesterday"></td>
    <td class="schoMmr"></td>
    <td class="schoLast"></td>`);
}

function editScholar(r) {
  let _config = JSON.parse(window.localStorage.getItem("config"));
  let _storedSlp = JSON.parse(window.localStorage.getItem("storedSlp"));
  let _ySlp = 0;

  if(_config != null && _config[r]) {

    if(_storedSlp) {
      var yesterDate = new Date();
      yesterDate.setDate(yesterDate.getDate() - 1);
      let _yesterday = convertDateToUTC(yesterDate);

      let _slp = 0;
      if(_storedSlp[r] && _storedSlp[r][_yesterday] && _storedSlp[r][_yesterday]['slp']) {
        _ySlp = _storedSlp[r][_yesterday]['slp'];

        var twoDb4 = new Date();
        twoDb4.setDate(twoDb4.getDate() - 2);
        let _twoDb4 = convertDateToUTC(twoDb4);
        if(_storedSlp[r][_twoDb4] && _storedSlp[r][_twoDb4]['slp']) {
          _2Db4Slp = _storedSlp[r][_twoDb4]['slp'];
          _ySlp = _ySlp - _2Db4Slp;
        }
      }
    }

    if(_config[r].key) {
      var decryptedBytes = CryptoJS.AES.decrypt(_config[r].key, "gj*d%uV@zJpiFCsG");
      var _key = decryptedBytes.toString(CryptoJS.enc.Utf8);
      $('#sKey').val(_key);
    }

    $('#sName').val(_config[r].name);
    $('#sRonin').val(_config[r].eth);
    $('#sPerc').val(_config[r].managerShare);
    $('#ySLP').val(_ySlp);
    $('#addScholar').modal('show');
  }
}

function storeSlp(trimRonin, slp, lastClaim) {
  // store slp with Date
  let _now = convertDateToUTC(new Date());
  let _storedSlp = JSON.parse(window.localStorage.getItem("storedSlp"));
  let _data = JSON.parse(window.sessionStorage.getItem(trimRonin));
  let _currSlp = 0;

  if(_storedSlp == null) {
    _storedSlp = {}
  }
  if(_storedSlp[trimRonin] == null) {
    _storedSlp[trimRonin] = {}
  }
  if(_storedSlp[trimRonin][_now] == null) {
    _storedSlp[trimRonin][_now] = {}
  }
  _storedSlp[trimRonin][_now]['slp'] = slp;

  let _prevDate = new Date(Date(_now));
  _prevDate.setDate(_prevDate.getDate() - 1);
  _prevDate = convertDateToUTC(_prevDate);
  if(_storedSlp[trimRonin][_now] != null) {
    _storedSlp[trimRonin][_now]['reset'] = false;
    if(_storedSlp[trimRonin][_prevDate] == undefined) {
      _storedSlp[trimRonin][_now]['reset'] = true;
      _storedSlp[trimRonin][_now]['day'] = 1;
      _currSlp = slp;
      _storedSlp[trimRonin][_now]['currSlp'] = _currSlp;
    } else {
      _currSlp = _storedSlp[trimRonin][_now]['slp'] - _storedSlp[trimRonin][_prevDate]['slp'];
      if(!(_storedSlp[trimRonin][_now]['bmc'] && _data['mmr'] == undefined)) {
        _storedSlp[trimRonin][_now]['bmc'] = 0;
      }
      if(_data['mmr'] < 1000) {
        _storedSlp[trimRonin][_now]['bmc'] = _storedSlp[trimRonin][_prevDate]['bmc'] + 1;
      }
      _storedSlp[trimRonin][_now]['day'] = _storedSlp[trimRonin][_prevDate]['day'] + 1;
      if(_currSlp < 0) {
        _currSlp = slp;
        _storedSlp[trimRonin][_now]['day'] = (slp > 0 ? 1 : 0);
        _storedSlp[trimRonin][_now]['reset'] = true;
      }
      if(_storedSlp[trimRonin][_now]['currSlp'] > _currSlp) {
        _currSlp = _storedSlp[trimRonin][_now]['currSlp'];
      } else {
        _storedSlp[trimRonin][_now]['currSlp'] = _currSlp;
      }
    }
  }

  window.localStorage.setItem("storedSlp", JSON.stringify(_storedSlp));
  return _currSlp;
}

function getEthPrice(currency) {
  let _res = 0;
  $.ajax({
    url: 'https://api.coingecko.com/api/v3/coins/ethereum'+'?'+minuteCache(),
    success: function(result) {
      let cryptData = {};
      cryptData['thumb'] = result.image.thumb;
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
      cryptData['thumb'] = result.image.thumb;
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
      cryptData['thumb'] = result.image.thumb;
      cryptData['current_price'] = result.market_data.current_price[currency];
      cryptData['price_change_percentage_24h'] = result.market_data.price_change_percentage_24h;
      cryptData['currency'] = currency;

      window.sessionStorage.setItem("getSlpPrice", JSON.stringify(cryptData));
      setCryptoPrice('#convSLP', cryptData);
      setOverviewData(cryptData['current_price'], data[0], data[1], data[2], data[3], data[4], data[5], data[6]);
    }
  });
}

function setCryptoPrice(cryp, result) {
  let dollarUSLocale = Intl.NumberFormat('en-US', {maximumFractionDigits: 2});
  $(cryp).html(`<img src="${result['thumb']}"><span class="curAlign">&nbsp;${dollarUSLocale.format(result['current_price'])} ${result['currency'].toUpperCase()}&nbsp;</span><div class="perc ${result['price_change_percentage_24h'] > 0 ? 'bg-success' : 'bg-danger'}"><span>${parseFloat(result['price_change_percentage_24h']).toFixed(2)}%</span>&nbsp;<img src="${result['price_change_percentage_24h'] > 0 ? './img/up-arrow.png' : './img/down-arrow.png'}"></div>`);
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

function removeScholar(r) {
  if (confirm("Ok to confirm remove")) {
    let _conf = JSON.parse(window.localStorage.getItem("config"));
    if(_conf != null) {
      if(_conf.hasOwnProperty(r)) {
        delete _conf[r];
        $('#'+r).remove();
        window.localStorage.setItem("config", JSON.stringify(_conf));
      }
    }
  }
}

function setAllData() {
    let _chartData = [];
    let _chartLabel = [];
    let chartTotalSLP = 0;
    let totalSLP = 0;
    let totalAvg = 0;
    let totalManagerSLP = 0;
    let totalScholarSLP = 0;
    let totalRoninSLP = 0;
    let _now = convertDateToUTC(new Date());
    let count = 0;
    let _config = JSON.parse(window.localStorage.getItem("config"));
    let currency = 'php';

    if(_config != null) {
      if(_config != null) {
        for (var i in _config) {
          let _trimRonin = _config[i].eth.replace("ronin:", "");
          let _storedSlp = JSON.parse(window.localStorage.getItem("storedSlp"));
          let _overAllData = JSON.parse(window.sessionStorage.getItem("overAllData"));

          if(_storedSlp != null) {
            if(_storedSlp[_trimRonin] != null) {
              if(_storedSlp[_trimRonin][_now] != null) {
                if(_storedSlp[_trimRonin][_now]['currSlp'] != null) {
                  _chartLabel.push(_config[i].name);
                  _chartData.push(_storedSlp[_trimRonin][_now]['currSlp']);
                  chartTotalSLP += _storedSlp[_trimRonin][_now]['currSlp'];
                  totalSLP += _storedSlp[_trimRonin][_now]['slp'];
                }
              }
            }
          }

          if(_overAllData != null) {
            if(_overAllData[_trimRonin] != null) {
              if(_overAllData[_trimRonin][_now] != null) {
                  totalAvg += _overAllData[_trimRonin][_now]['avg'];
                  totalManagerSLP += _overAllData[_trimRonin][_now]['managerSLP'];
                  totalScholarSLP += _overAllData[_trimRonin][_now]['scholarSLP'];
                  totalRoninSLP += _overAllData[_trimRonin][_now]['roninSLP'];
                  count++;
              }
            }
          }
        }
      }

      let _data = [totalSLP, totalRoninSLP, totalManagerSLP, totalScholarSLP, totalAvg, count, currency];

      let _getEthPrice = JSON.parse(window.sessionStorage.getItem("getEthPrice"));
      if(_getEthPrice != null) {
        setCryptoPrice('#convETH', _getEthPrice);
      }

      let _getAxsPrice = JSON.parse(window.sessionStorage.getItem("getAxsPrice"));
      if(_getAxsPrice != null) {
        setCryptoPrice('#convAXS', _getAxsPrice);
      }

      let _getSlpPrice = JSON.parse(window.sessionStorage.getItem("getSlpPrice"));
      let _slpPrice = 0;
      if(_getSlpPrice != null) {
        setCryptoPrice('#convSLP', _getSlpPrice);
        _slpPrice = _getSlpPrice['current_price'];
      }
      setOverviewData(_slpPrice, totalSLP, totalRoninSLP, totalManagerSLP, totalScholarSLP, totalAvg, count, currency);

      getEthPrice(currency);
      getAxsPrice(currency);
      getSlpPrice(currency, _data);

      $('#chartTotalSLP').html(chartTotalSLP);
      $('#totalSlp').html(`${chartTotalSLP} SLP${_getSlpPrice != null ? ('<br><small>'+ Math.floor(chartTotalSLP * _getSlpPrice['current_price'])+ ' ' +_getSlpPrice['currency'].toUpperCase()+'</small>') : ''}`);
      $('#schoCount').html(count + ' items');

      let data1 = {
          labels: _chartLabel,
          datasets: [
              {
                  data: _chartData,
                  backgroundColor: ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928','#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f'],
                  borderWidth: 0,
              }
          ]
      }

      let ctx = document.getElementById("canvas1").getContext("2d");
      new Chart(ctx, {
          type: 'doughnut',
          data: data1,
          options: {
              cutoutPercentage: 80,
              responsive: true,
              legend: {
                  display: false,
              },
              plugins: {
                  datalabels: {
                      display: false
                  }
              }
          },
      });
    }
}

function setOverviewData(slpPrice, totalSLP, totalRoninSLP, totalManagerSLP, totalScholarSLP, totalAvg, count, currency) {
  let dollarUSLocale = Intl.NumberFormat('en-US', {maximumFractionDigits: 0});
  $('#unclaimedTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/locked.png"></div><div class="col col-sm-8"><span>${dollarUSLocale.format(Math.round(totalSLP) * slpPrice)}</span><span><small>${Math.round(totalSLP)} SLP</small></span><small>Unclaimed</small></div></div>`);
  $('#claimedTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/unlocked.png"></div><div class="col col-sm-8"><span>${dollarUSLocale.format(Math.round(totalRoninSLP) * slpPrice)}</span><span><small>${Math.round(totalRoninSLP)} SLP</small></span><small>Ronin</small></div></div>`);
  $('#managerTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/teacher.png"></div><div class="col col-sm-8"><span>${dollarUSLocale.format(Math.round(totalManagerSLP) * slpPrice)}</span><span><small>${Math.round(totalManagerSLP)} SLP</small></span><small>Manager</small></div></div>`);
  $('#scholarTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/student.png"></div><div class="col col-sm-8"><span>${dollarUSLocale.format(Math.round(totalScholarSLP) * slpPrice)}</span><span><small>${Math.round(totalScholarSLP)} SLP</small></span><small>Scholar</small></div></div>`);
  $('#averageTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/chart.png"></div><div class="col col-sm-8"><span>${dollarUSLocale.format(Math.round(totalAvg/count) * slpPrice)}</span><span><small>${Math.round(totalAvg/count)} SLP</small></span><small>Average</small></div></div>`);
  $('#overAllTotal').html(`<div class="row"><div class="col col-sm-4 ovIcon"><img src="./img/coin.png"></div><div class="col col-sm-8"><span>${dollarUSLocale.format(Math.round(totalSLP+totalRoninSLP) * slpPrice)}</span><span><small>${Math.round(totalSLP+totalRoninSLP)} SLP</small></span><small>Total</small></div></div>`);
}

function exportData(id) {
    let dataStr = window.localStorage.getItem(id);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = id+'.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function setImportData(id) {
  const configFile = document.getElementById(id);
  configFile.addEventListener('change', (event) => {
    const fileList = event.target.files;
    const reader = new FileReader();

    reader.addEventListener('load', function() {
      window.localStorage.setItem(id, reader.result);
      window.location.reload();
    });
    reader.readAsText(configFile.files[0]);
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

function toDoubleDigit(num) {
  return num.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  })
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
