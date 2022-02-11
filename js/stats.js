let _loader = [];

jQuery(document).ready(function($) {
  setImportData('statsConf');

  let _config = JSON.parse(window.localStorage.getItem("statsConf"));

  if(_config != null) {
    for (var i in _config) {
      displayRow(_config[i]);
      loadData(_config[i], 'player-stats');
      //loadData(_config[i], 'quests');
    }
    setTimeout(function(){ $('#loading').hide(); }, 2000);
  } else {
    $('#loading').hide();
  }
});

function displayRow(i) {
  let trimRonin = i.eth.replace("ronin:", "");

  $('#detail').append(`<tr id="${trimRonin}">
    <td><span>${i.name}</span></td>
    <td class="schoEnergy"></td>
    <td class="schoCheckin"></td>
    <td class="schoPvE"></td>
    <td class="schoPvESLP"></td>
    <td class="schoPvP"></td>
    <td class="schoPvPPROG"></td>
    <td class="schoClaimed"></td>
    <td><a href="#" onclick="editScholar('${trimRonin}')" class="text-primary"><span class="bi bi-pencil-square"></span></a></td>`);
}

function editScholar(r) {
  let _config = JSON.parse(window.localStorage.getItem("statsConf"));
  if(_config != null && _config[r]) {
    var decryptedBytes = CryptoJS.AES.decrypt(_config[r].key, "gj*d%uV@zJpiFCsG");
    var _key = decryptedBytes.toString(CryptoJS.enc.Utf8);

    $('#sName').val(_config[r].name);
    $('#sRonin').val(_config[r].eth);
    $('#sKey').val(_key);
    $('#addScholar').modal('show');
  }
}

function reloadScholar(i) {
  let _config = JSON.parse(window.localStorage.getItem("statsConf"));
  loadData(_config[i], 'player-stats');
  //loadData(_config[i], 'quests');
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
        let _energy = 'XX';
        _cached[_now]['energy'] = 0;
        if(data.meta_data.max_energy) {
          _energy = toDoubleDigit(data.player_stat.remaining_energy);
          if(data.player_stat.remaining_energy == 0) {
            _cached[_now]['energy'] = 1;
          }
        }
        window.localStorage.setItem(trimRonin, JSON.stringify(_cached));
        let _pveSLP = toDoubleDigit(data.player_stat.pve_slp_gained_last_day);

        $('#'+trimRonin+' .schoEnergy').html(`<span class=${_energy == 'XX' ? "b-danger" : _energy == '00' ? "b-success" : "b-warning"}>${_energy}</span>`);
        $('#'+trimRonin+' .schoPvESLP').html(`<span class=${_pveSLP == 50 ? "b-success" : _pveSLP == 0 ? "b-danger" : "b-warning"}>${_pveSLP}</span>`);
      }
      if(url == 'quests') {
        let _checkin = data.items[0].missions[0].is_completed ? 'Y' : 'N';
        let _pve = data.items[0].missions[1].is_completed ? 'Y' : 'N';
        let _pvp = data.items[0].missions[2].is_completed ? 'Y' : 'N';
        let _pvpProg = toDoubleDigit(data.items[0].missions[2].progress);
        let _claimed = data.items[0].claimed ? 'Y' : 'N';

        _cached[_now]['claim'] = data.items[0].claimed ? 1 : 0;
        _cached[_now]['win'] = _pvpProg;
        window.localStorage.setItem(trimRonin, JSON.stringify(_cached));

        $('#'+trimRonin+' .schoCheckin').html(`<span class=${_checkin == 'N' ? "b-danger" : "b-success"}>${_checkin}</span>`);
        $('#'+trimRonin+' .schoPvE').html(`<span class=${_pve == 'N' ? "b-danger" : "b-success"}>${_pve}</span>`);
        $('#'+trimRonin+' .schoPvP').html(`<span class=${_pvp == 'N' ? "b-danger" : "b-success"}>${_pvp}</span>`);
        $('#'+trimRonin+' .schoClaimed').html(`<span class=${_claimed == 'N' ? "b-danger" : "b-success"}>${_claimed}</span>`);
        $('#'+trimRonin+' .schoPvPPROG').html(`<span class=${_pvpProg >= 5 ? "b-success" : _pvpProg == 0 ? "b-danger" : "b-warning"}>${_pvpProg}</span>`);
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
  } else {
    $('#'+trimRonin+' .schoEnergy').html(`<span class="b-success">Y</span>`);
    $('#'+trimRonin+' .schoPvESLP').html(`<span class="b-success">50</span>`);
    $('#'+trimRonin+' .schoPvPPROG').html(`<span class="b-success">${_cached[_now]['win']}</span>`);
    $('#'+trimRonin+' .schoCheckin').html(`<span class="b-success">Y</span>`);
    $('#'+trimRonin+' .schoPvE').html(`<span class="b-success">Y</span>`);
    $('#'+trimRonin+' .schoPvP').html(`<span class="b-success">Y</span>`);
    $('#'+trimRonin+' .schoClaimed').html(`<span class="b-success">Y</span>`);
  }
}

function toDoubleDigit(num) {
  return num.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  })
}

$('#saveBtn').click(() => {
  if(validateScholar()) {
    let _conf = JSON.parse(window.localStorage.getItem("statsConf"));
    if(_conf == null) {
      _conf = {}
    }

    var encryptedKey = CryptoJS.AES.encrypt($('#sKey').val(), "gj*d%uV@zJpiFCsG").toString();
    let _data = {}
    _data['name'] = $('#sName').val();
    _data['eth'] = $('#sRonin').val();
    _data['key'] = encryptedKey;

    let trimRonin = $('#sRonin').val().replace("ronin:", "");

    _conf[trimRonin] = _data;
    window.localStorage.setItem("statsConf", JSON.stringify(_conf));

    $('#sName').val('');
    $('#sRonin').val('');
    $('#sPerc').val('');
    $('#addScholar').modal('hide');
  }
})

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

  if($('#sKey').val().length == 0) {
    valid = false;
    $('#sKey').addClass('b-invalid');
  } else {
    $('#sKey').removeClass('b-invalid');
  }
  return valid;
}

function convertDateToUTC(date) {
  return (getDateUTC(date).getMonth()+1)+'/'+getDateUTC(date).getDate()+'/'+getDateUTC(date).getFullYear();
}

function getDateUTC(date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
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
