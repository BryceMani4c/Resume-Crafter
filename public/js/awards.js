// loads and renders all awards in a table
function loadAwards(){
    fetch("/api/awards")
    .then(result => {
        return result.json()
    })
    .then(data => {
        let divAwards = document.querySelector('#divAwards')
        divAwards.innerHTML = ''
        if(data.outcome == "success"){
            let arrAwards = data.message
            if(arrAwards.length > 0){
                let strHTML = '<div class="card"><div class="card-body"><table class="table table-sm mb-0"><thead><tr><th>Award</th><th>Issuer</th><th>Date</th><th></th></tr></thead><tbody>'
                for(let i = 0; i < arrAwards.length; i++){
                    let objAward = arrAwards[i]
                    strHTML += `<tr>
                        <td>${objAward.AwardName}</td>
                        <td>${objAward.Issuer || ''}</td>
                        <td>${objAward.DateEarned || ''}</td>
                        <td><button class="btn btn-outline-danger btn-sm" onclick="deleteAward('${objAward.AwardID}')" aria-label="Delete ${objAward.AwardName}">X</button></td>
                    </tr>`
                }
                strHTML += '</tbody></table></div></div>'
                divAwards.innerHTML = strHTML
            }
        }
    })
}

// adds a new award to the database
document.querySelector('#btnAddAward').addEventListener('click',function(){
    let strAwardName = document.querySelector('#txtAwardName').value.trim()
    let strIssuer = document.querySelector('#txtAwardIssuer').value.trim()
    let strDate = document.querySelector('#txtAwardDate').value.trim()

    if(strAwardName.length < 1){
        Swal.fire({title:"Oh no!",html:"<p>You must enter an <b>Award Name</b></p>",icon:"error"})
        return
    }

    fetch("/api/awards",{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({awardname:strAwardName,issuer:strIssuer,dateearned:strDate})
    })
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            Swal.fire({title:"Award Added!",icon:"success",timer:1500})
            document.querySelector('#txtAwardName').value = ''
            document.querySelector('#txtAwardIssuer').value = ''
            document.querySelector('#txtAwardDate').value = ''
            loadAwards()
        } else {
            Swal.fire({title:"Error",text:data.message,icon:"error"})
        }
    })
})

// deletes an award
function deleteAward(strAwardID){
    fetch("/api/awards/" + strAwardID,{method:'DELETE'})
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            loadAwards()
        }
    })
}
