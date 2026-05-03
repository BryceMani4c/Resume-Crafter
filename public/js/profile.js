// loads user profile data into form fields
function loadProfile(){
    fetch("/api/userinfo")
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success" && data.message.length > 0){
            let objUser = data.message[0]
            document.querySelector('#txtFirstName').value = objUser.FirstName || ''
            document.querySelector('#txtLastName').value = objUser.LastName || ''
            document.querySelector('#txtEmail').value = objUser.Email || ''
            document.querySelector('#txtPhone').value = objUser.Phone || ''
            document.querySelector('#txtCity').value = objUser.City || ''
            document.querySelector('#txtState').value = objUser.State || ''
            document.querySelector('#txtLinkedIn').value = objUser.LinkedIn || ''
            document.querySelector('#txtSummary').value = objUser.Summary || ''
        }
    })
}

// saves profile info to database
document.querySelector('#btnSaveProfile').addEventListener('click',function(){
    let strFirstName = document.querySelector('#txtFirstName').value.trim()
    let strLastName = document.querySelector('#txtLastName').value.trim()
    let strEmail = document.querySelector('#txtEmail').value.trim()
    let strPhone = document.querySelector('#txtPhone').value.trim()
    let strCity = document.querySelector('#txtCity').value.trim()
    let strState = document.querySelector('#txtState').value.trim()
    let strLinkedIn = document.querySelector('#txtLinkedIn').value.trim()
    let strSummary = document.querySelector('#txtSummary').value.trim()

    let blnError = false
    let strMessage = ''

    if(strFirstName.length < 1){
        blnError = true
        strMessage += '<p>You must enter a <b>First Name</b></p>'
    }
    if(strLastName.length < 1){
        blnError = true
        strMessage += '<p>You must enter a <b>Last Name</b></p>'
    }

    if(blnError != false){
        Swal.fire({title:"Oh no!",html:strMessage,icon:"error"})
    } else {
        fetch("/api/userinfo",{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({firstname:strFirstName,lastname:strLastName,email:strEmail,phone:strPhone,city:strCity,state:strState,linkedin:strLinkedIn,summary:strSummary})
        })
        .then(result => {
            return result.json()
        })
        .then(data => {
            if(data.outcome == "success"){
                Swal.fire({title:"Saved!",text:data.message,icon:"success",timer:1500})
            } else {
                Swal.fire({title:"Error",text:data.message,icon:"error"})
            }
        })
    }
})

// sends summary to gemini for ai improvement suggestion
document.querySelector('#btnAISummary').addEventListener('click',function(){
    let strSummary = document.querySelector('#txtSummary').value.trim()
    if(strSummary.length < 1){
        Swal.fire({title:"Oh no!",text:"Enter a summary first so AI can improve it.",icon:"error"})
        return
    }
    Swal.fire({title:"Getting AI suggestion...",allowOutsideClick:false,didOpen:()=>{Swal.showLoading()}})
    fetch("/api/gemini",{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({text:strSummary,type:"summary"})
    })
    .then(result => {
        return result.json()
    })
    .then(data => {
        Swal.close()
        if(data.outcome == "success"){
            Swal.fire({
                title:"AI Suggestion",
                html:"<p style='text-align:left'>" + data.message + "</p>",
                icon:"info",
                showCancelButton:true,
                confirmButtonText:"Use This",
                cancelButtonText:"Keep Mine"
            }).then((result) => {
                if(result.isConfirmed){
                    document.querySelector('#txtSummary').value = data.message
                }
            })
        } else {
            Swal.fire({title:"Error",text:data.message,icon:"error"})
        }
    })
})
