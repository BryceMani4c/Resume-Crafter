function loadSettings(){
    fetch("/api/settings/gemini_api_key")
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success" && data.message.length > 0){
            document.querySelector('#txtGeminiKey').value = data.message[0].SettingValue || ''
        }
    })
}

document.querySelector('#btnSaveSettings').addEventListener('click',function(){
    let strKey = document.querySelector('#txtGeminiKey').value.trim()

    fetch("/api/settings",{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({key:"gemini_api_key",value:strKey})
    })
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            Swal.fire({title:"Settings Saved!",icon:"success",timer:1500})
        } else {
            Swal.fire({title:"Error",text:data.message,icon:"error"})
        }
    })
})
