function loadJobs(){
    fetch("/api/jobs")
    .then(result => {
        return result.json()
    })
    .then(data => {
        let divJobs = document.querySelector('#divJobs')
        divJobs.innerHTML = ''
        if(data.outcome == "success"){
            let arrJobs = data.message
            for(let i = 0; i < arrJobs.length; i++){
                let objJob = arrJobs[i]
                let strEnd = objJob.Current ? "Present" : objJob.EndDate
                let strCard = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 class="card-title mb-1">${objJob.Title}</h5>
                                    <p class="text-muted mb-1">${objJob.Company} | ${objJob.StartDate} - ${strEnd}</p>
                                </div>
                                <button class="btn btn-outline-danger btn-sm" onclick="deleteJob('${objJob.JobID}')" aria-label="Delete ${objJob.Title}">Delete</button>
                            </div>
                            <div class="mt-2">
                                <div id="divDetails_${objJob.JobID}"></div>
                                <div class="input-group mt-2">
                                    <input class="form-control" type="text" id="txtDetail_${objJob.JobID}" placeholder="Add responsibility/detail" aria-label="Add responsibility for ${objJob.Title}">
                                    <button class="btn btn-outline-primary" type="button" onclick="addDetail('${objJob.JobID}')" aria-label="Add detail">Add</button>
                                    <button class="btn btn-outline-secondary" type="button" onclick="aiDetail('${objJob.JobID}')" aria-label="Get AI suggestion">AI</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `
                divJobs.innerHTML += strCard
                loadJobDetails(objJob.JobID)
            }
        }
    })
}

function loadJobDetails(strJobID){
    fetch("/api/jobdetails/" + strJobID)
    .then(result => {
        return result.json()
    })
    .then(data => {
        let divDetails = document.querySelector('#divDetails_' + strJobID)
        if(!divDetails) return
        divDetails.innerHTML = ''
        if(data.outcome == "success"){
            let arrDetails = data.message
            for(let i = 0; i < arrDetails.length; i++){
                let objDetail = arrDetails[i]
                divDetails.innerHTML += `
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span style="font-size:small">${objDetail.Description}</span>
                        <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteDetail('${objDetail.DetailID}','${strJobID}')" aria-label="Delete detail">X</button>
                    </div>
                `
            }
        }
    })
}

document.querySelector('#btnAddJob').addEventListener('click',function(){
    let strCompany = document.querySelector('#txtCompany').value.trim()
    let strTitle = document.querySelector('#txtJobTitle').value.trim()
    let strStartDate = document.querySelector('#txtStartDate').value.trim()
    let strEndDate = document.querySelector('#txtEndDate').value.trim()
    let blnCurrent = document.querySelector('#chkCurrent').checked

    let blnError = false
    let strMessage = ''

    if(strCompany.length < 1){
        blnError = true
        strMessage += '<p>You must enter a <b>Company</b></p>'
    }
    if(strTitle.length < 1){
        blnError = true
        strMessage += '<p>You must enter a <b>Job Title</b></p>'
    }
    if(strStartDate.length < 1){
        blnError = true
        strMessage += '<p>You must enter a <b>Start Date</b></p>'
    }

    if(blnError != false){
        Swal.fire({title:"Oh no!",html:strMessage,icon:"error"})
    } else {
        fetch("/api/jobs",{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({company:strCompany,title:strTitle,startdate:strStartDate,enddate:strEndDate,current:blnCurrent})
        })
        .then(result => {
            return result.json()
        })
        .then(data => {
            if(data.outcome == "success"){
                Swal.fire({title:"Job Added!",text:data.message,icon:"success",timer:1500})
                document.querySelector('#txtCompany').value = ''
                document.querySelector('#txtJobTitle').value = ''
                document.querySelector('#txtStartDate').value = ''
                document.querySelector('#txtEndDate').value = ''
                document.querySelector('#chkCurrent').checked = false
                loadJobs()
            } else {
                Swal.fire({title:"Error",text:data.message,icon:"error"})
            }
        })
    }
})

function deleteJob(strJobID){
    Swal.fire({
        title:"Are you sure?",
        text:"This will delete the job and all its details.",
        icon:"warning",
        showCancelButton:true,
        confirmButtonText:"Yes, delete it"
    }).then((result) => {
        if(result.isConfirmed){
            fetch("/api/jobs/" + strJobID,{method:'DELETE'})
            .then(result => {
                return result.json()
            })
            .then(data => {
                if(data.outcome == "success"){
                    loadJobs()
                }
            })
        }
    })
}

function addDetail(strJobID){
    let txtDetail = document.querySelector('#txtDetail_' + strJobID)
    let strDescription = txtDetail.value.trim()

    if(strDescription.length < 1){
        Swal.fire({title:"Oh no!",text:"You must enter a detail.",icon:"error"})
        return
    }

    fetch("/api/jobdetails",{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({jobid:strJobID,description:strDescription})
    })
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            txtDetail.value = ''
            loadJobDetails(strJobID)
        }
    })
}

function deleteDetail(strDetailID,strJobID){
    fetch("/api/jobdetails/" + strDetailID,{method:'DELETE'})
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            loadJobDetails(strJobID)
        }
    })
}

function aiDetail(strJobID){
    let txtDetail = document.querySelector('#txtDetail_' + strJobID)
    let strText = txtDetail.value.trim()
    if(strText.length < 1){
        Swal.fire({title:"Oh no!",text:"Enter a detail first so AI can improve it.",icon:"error"})
        return
    }
    Swal.fire({title:"Getting AI suggestion...",allowOutsideClick:false,didOpen:()=>{Swal.showLoading()}})
    fetch("/api/gemini",{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({text:strText,type:"job"})
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
                    txtDetail.value = data.message
                }
            })
        } else {
            Swal.fire({title:"Error",text:data.message,icon:"error"})
        }
    })
}
