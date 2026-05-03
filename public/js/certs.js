// loads and renders all certifications in a table
function loadCerts(){
    fetch("/api/certifications")
    .then(result => {
        return result.json()
    })
    .then(data => {
        let divCerts = document.querySelector('#divCerts')
        divCerts.innerHTML = ''
        if(data.outcome == "success"){
            let arrCerts = data.message
            if(arrCerts.length > 0){
                let strHTML = '<div class="card"><div class="card-body"><table class="table table-sm mb-0"><thead><tr><th>Certification</th><th>Issuer</th><th>Date</th><th></th></tr></thead><tbody>'
                for(let i = 0; i < arrCerts.length; i++){
                    let objCert = arrCerts[i]
                    strHTML += `<tr>
                        <td>${objCert.CertName}</td>
                        <td>${objCert.Issuer || ''}</td>
                        <td>${objCert.DateEarned || ''}</td>
                        <td><button class="btn btn-outline-danger btn-sm" onclick="deleteCert('${objCert.CertID}')" aria-label="Delete ${objCert.CertName}">X</button></td>
                    </tr>`
                }
                strHTML += '</tbody></table></div></div>'
                divCerts.innerHTML = strHTML
            }
        }
    })
}

// adds a new certification to the database
document.querySelector('#btnAddCert').addEventListener('click',function(){
    let strCertName = document.querySelector('#txtCertName').value.trim()
    let strIssuer = document.querySelector('#txtCertIssuer').value.trim()
    let strDate = document.querySelector('#txtCertDate').value.trim()

    if(strCertName.length < 1){
        Swal.fire({title:"Oh no!",html:"<p>You must enter a <b>Certification Name</b></p>",icon:"error"})
        return
    }

    fetch("/api/certifications",{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({certname:strCertName,issuer:strIssuer,dateearned:strDate})
    })
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            Swal.fire({title:"Certification Added!",icon:"success",timer:1500})
            document.querySelector('#txtCertName').value = ''
            document.querySelector('#txtCertIssuer').value = ''
            document.querySelector('#txtCertDate').value = ''
            loadCerts()
        } else {
            Swal.fire({title:"Error",text:data.message,icon:"error"})
        }
    })
})

// deletes a certification
function deleteCert(strCertID){
    fetch("/api/certifications/" + strCertID,{method:'DELETE'})
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            loadCerts()
        }
    })
}
