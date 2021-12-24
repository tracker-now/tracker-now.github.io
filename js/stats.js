jQuery(document).ready(function($) {
  setImportData('config');

  let _config = JSON.parse(window.localStorage.getItem("config"));

  if(_config != null) {
    for (var i in _config) {
      displayRow(_config[i]);
      loadData(_config[i], 'player-stats');
      loadData(_config[i], 'quests');
    }
    setTimeout(function(){ $('#loading').hide(); }, 2000);
  } else {
    $('#loading').hide();
  }
});

function displayRow(i) {
  let trimRonin = i.eth.replace("ronin:", "");

  $('#detail').append(`<tr id="${trimRonin}"><th scope="row" class="reload-cont"><a href="#" onclick="reloadScholar('${trimRonin}')"><span class="bi bi-arrow-clockwise"></span></a></th>
    <td><span>${i.name}</span></td>
    <td class="schoEnergy"></td>
    <td class="schoCheckin"></td>
    <td class="schoPvE"></td>
    <td class="schoPvESLP"></td>
    <td class="schoPvP"></td>
    <td class="schoClaimed"></td>
    <td><a href="#" onclick="editScholar('${trimRonin}')" class="text-primary"><span class="bi bi-pencil-square"></span></a></td>`);
}

function editScholar(r) {
  let _config = JSON.parse(window.localStorage.getItem("config"));
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
  let _config = JSON.parse(window.localStorage.getItem("config"));
  loadData(_config[i], 'player-stats');
  loadData(_config[i], 'quests');
}

function loadData(i, url) {
  let xRonin = i.eth.replace("ronin:", "0x");
  let trimRonin = i.eth.replace("ronin:", "");
  var decryptedBytes = CryptoJS.AES.decrypt(i.key, "gj*d%uV@zJpiFCsG");
  var _key = decryptedBytes.toString(CryptoJS.enc.Utf8);

  $.ajax({
  url: 'https://game-api.skymavis.com/game-api/clients/'+xRonin+'/'+url,
  type: 'GET',
  beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer '+_key);
  },
  data: {},
  success: function (data) {
    if(url == 'player-stats') {
      let _energy = 'PND';
      if(data.meta_data.max_energy) {
        _energy = data.player_stat.remaining_energy;
        if(data.player_stat.remaining_energy == 0) {
          _energy = 'DNE';
        }
      }
      let _pveSLP = data.player_stat.pve_slp_gained_last_day;

      $('#'+trimRonin+' .schoEnergy').html(`<span class=${_energy == 'PND' ? "b-danger" : _energy == 'DNE' ? "b-success" : "b-warning"}>${_energy}</span>`);
      $('#'+trimRonin+' .schoPvESLP').html(`<span class=${_pveSLP == 50 ? "b-success" : _pveSLP == 0 ? "b-danger" : "b-warning"}>${_pveSLP}</span>`);
    }
    if(url == 'quests') {
      let _checkin = data.items[0].missions[0].is_completed ? 'DNE' : 'PND';
      let _pve = data.items[0].missions[1].is_completed ? 'DNE' : 'PND';
      let _pvp = data.items[0].missions[2].is_completed ? 'DNE' : 'PND';
      let _claimed = data.items[0].claimed ? 'DNE' : 'PND';

      $('#'+trimRonin+' .schoCheckin').html(`<span class=${_checkin == 'PND' ? "b-danger" : "b-success"}>${_checkin}</span>`);
      $('#'+trimRonin+' .schoPvE').html(`<span class=${_pve == 'PND' ? "b-danger" : "b-success"}>${_pve}</span>`);
      $('#'+trimRonin+' .schoPvP').html(`<span class=${_pvp == 'PND' ? "b-danger" : "b-success"}>${_pvp}</span>`);
      $('#'+trimRonin+' .schoClaimed').html(`<span class=${_claimed == 'PND' ? "b-danger" : "b-success"}>${_claimed}</span>`);
    }
  },
  error: function () { },
  });
}

$('#saveBtn').click(() => {
  if(validateScholar()) {
    let _conf = JSON.parse(window.localStorage.getItem("config"));
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
    window.localStorage.setItem("config", JSON.stringify(_conf));

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

function reLoad() {
  window.location.reload();
  $('#loading').show();
}
