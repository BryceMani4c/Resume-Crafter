// imports and configuration
require('dotenv').config()
const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const {v4: uuidv4} = require('uuid')
const HTTP_PORT = 8000

var app = express()
app.use(express.json())
app.use(express.static('public'))

// connects to database
const dbResume = new sqlite3.Database('resume.db',(err) => {
    if(err){
        console.error("Error opening database:",err.message)
    } else {
        console.log("Connected to resume.db")
    }
})

// creates tables if they don't exist
dbResume.serialize(function(){
    dbResume.run(`CREATE TABLE IF NOT EXISTS tblUserInfo (
        UserID TEXT PRIMARY KEY,FirstName TEXT,LastName TEXT,Email TEXT,Phone TEXT,City TEXT,State TEXT,LinkedIn TEXT,Summary TEXT)`)
    dbResume.run(`CREATE TABLE IF NOT EXISTS tblJobs (
        JobID TEXT PRIMARY KEY,Company TEXT,Title TEXT,StartDate TEXT,EndDate TEXT,Current INTEGER DEFAULT 0)`)
    dbResume.run(`CREATE TABLE IF NOT EXISTS tblJobDetails (
        DetailID TEXT PRIMARY KEY,JobID TEXT,Description TEXT,FOREIGN KEY (JobID) REFERENCES tblJobs(JobID))`)
    dbResume.run(`CREATE TABLE IF NOT EXISTS tblSkills (
        SkillID TEXT PRIMARY KEY,Category TEXT,SkillName TEXT)`)
    dbResume.run(`CREATE TABLE IF NOT EXISTS tblCertifications (
        CertID TEXT PRIMARY KEY,CertName TEXT,Issuer TEXT,DateEarned TEXT)`)
    dbResume.run(`CREATE TABLE IF NOT EXISTS tblAwards (
        AwardID TEXT PRIMARY KEY,AwardName TEXT,Issuer TEXT,DateEarned TEXT)`)
    dbResume.run(`CREATE TABLE IF NOT EXISTS tblSettings (
        SettingKey TEXT PRIMARY KEY,SettingValue TEXT)`)
})

// starts server
app.listen(HTTP_PORT,() => {
    console.log('Listening on',HTTP_PORT)
})

// returns user profile info
app.get("/api/userinfo",(req,res) => {
    const strQuery = "SELECT * FROM tblUserInfo LIMIT 1"
    dbResume.all(strQuery,[],function(err,rows){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:rows})
        }
    })
})

// saves or updates user profile info
app.post("/api/userinfo",(req,res) => {
    let strFirstName = req.body.firstname ? req.body.firstname : ""
    let strLastName = req.body.lastname ? req.body.lastname : ""
    let strEmail = req.body.email ? req.body.email : ""
    let strPhone = req.body.phone ? req.body.phone : ""
    let strCity = req.body.city ? req.body.city : ""
    let strState = req.body.state ? req.body.state : ""
    let strLinkedIn = req.body.linkedin ? req.body.linkedin : ""
    let strSummary = req.body.summary ? req.body.summary : ""

    strFirstName = strFirstName.trim()
    strLastName = strLastName.trim()
    strEmail = strEmail.trim()
    strPhone = strPhone.trim()
    strCity = strCity.trim()
    strState = strState.trim()
    strLinkedIn = strLinkedIn.trim()
    strSummary = strSummary.trim()

    let blnError = false
    let strMessage = ''

    // checks for required fields
    if(strFirstName.length < 1){
        blnError = true
        strMessage += 'You must provide a first name. '
    }
    if(strLastName.length < 1){
        blnError = true
        strMessage += 'You must provide a last name. '
    }

    // checks if user exists to update or insert new
    if(blnError == false){
        dbResume.all("SELECT * FROM tblUserInfo",[],function(err,rows){
            if(rows.length > 0){
                const strQuery = "UPDATE tblUserInfo SET FirstName=?,LastName=?,Email=?,Phone=?,City=?,State=?,LinkedIn=?,Summary=? WHERE UserID=?"
                dbResume.run(strQuery,[strFirstName,strLastName,strEmail,strPhone,strCity,strState,strLinkedIn,strSummary,rows[0].UserID],function(err){
                    if(err){
                        res.status(500).json({outcome:"error",message:err.message})
                    } else {
                        res.status(200).json({outcome:"success",message:"User info updated"})
                    }
                })
            } else {
                let strUserID = uuidv4()
                const strQuery = "INSERT INTO tblUserInfo VALUES (?,?,?,?,?,?,?,?,?)"
                dbResume.run(strQuery,[strUserID,strFirstName,strLastName,strEmail,strPhone,strCity,strState,strLinkedIn,strSummary],function(err){
                    if(err){
                        res.status(500).json({outcome:"error",message:err.message})
                    } else {
                        res.status(201).json({outcome:"success",message:"User info saved"})
                    }
                })
            }
        })
    } else {
        res.status(400).json({outcome:"error",message:strMessage})
    }
})

// returns all jobs
app.get("/api/jobs",(req,res) => {
    const strQuery = "SELECT * FROM tblJobs"
    dbResume.all(strQuery,[],function(err,rows){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:rows})
        }
    })
})

// adds a new job
app.post("/api/jobs",(req,res) => {
    let strCompany = req.body.company ? req.body.company : ""
    let strTitle = req.body.title ? req.body.title : ""
    let strStartDate = req.body.startdate ? req.body.startdate : ""
    let strEndDate = req.body.enddate ? req.body.enddate : ""
    let intCurrent = req.body.current ? 1 : 0

    strCompany = strCompany.trim()
    strTitle = strTitle.trim()
    strStartDate = strStartDate.trim()
    strEndDate = strEndDate.trim()

    let blnError = false
    let strMessage = ''

    // checks for required fields
    if(strCompany.length < 1){
        blnError = true
        strMessage += 'You must provide a company. '
    }
    if(strTitle.length < 1){
        blnError = true
        strMessage += 'You must provide a job title. '
    }
    if(strStartDate.length < 1){
        blnError = true
        strMessage += 'You must provide a start date. '
    }

    // checks blnError before inserting job
    if(blnError == false){
        let strJobID = uuidv4()
        const strQuery = "INSERT INTO tblJobs VALUES (?,?,?,?,?,?)"
        dbResume.run(strQuery,[strJobID,strCompany,strTitle,strStartDate,strEndDate,intCurrent],function(err){
            if(err){
                res.status(500).json({outcome:"error",message:err.message})
            } else {
                res.status(201).json({outcome:"success",message:"Job added",jobid:strJobID})
            }
        })
    } else {
        res.status(400).json({outcome:"error",message:strMessage})
    }
})

// deletes a job and its details
app.delete("/api/jobs/:jobid",(req,res) => {
    let strJobID = req.params.jobid

    if(!strJobID){
        res.status(400).json({outcome:"error",message:"Job ID must be provided"})
        return
    }

    dbResume.run("DELETE FROM tblJobDetails WHERE JobID = ?",[strJobID],function(err){
        const strQuery = "DELETE FROM tblJobs WHERE JobID = ?"
        dbResume.run(strQuery,[strJobID],function(err){
            if(err){
                res.status(500).json({outcome:"error",message:err.message})
            } else {
                res.status(200).json({outcome:"success",message:"Job deleted"})
            }
        })
    })
})

// returns details for a specific job
app.get("/api/jobdetails/:jobid",(req,res) => {
    let strJobID = req.params.jobid
    const strQuery = "SELECT * FROM tblJobDetails WHERE JobID = ?"
    dbResume.all(strQuery,[strJobID],function(err,rows){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:rows})
        }
    })
})

// adds a detail to a job
app.post("/api/jobdetails",(req,res) => {
    let strJobID = req.body.jobid ? req.body.jobid : ""
    let strDescription = req.body.description ? req.body.description : ""

    strJobID = strJobID.trim()
    strDescription = strDescription.trim()

    let blnError = false
    let strMessage = ''

    if(strJobID.length < 1){
        blnError = true
        strMessage += 'You must provide a job ID. '
    }
    if(strDescription.length < 1){
        blnError = true
        strMessage += 'You must provide a description. '
    }

    if(blnError == false){
        let strDetailID = uuidv4()
        const strQuery = "INSERT INTO tblJobDetails VALUES (?,?,?)"
        dbResume.run(strQuery,[strDetailID,strJobID,strDescription],function(err){
            if(err){
                res.status(500).json({outcome:"error",message:err.message})
            } else {
                res.status(201).json({outcome:"success",message:"Detail added"})
            }
        })
    } else {
        res.status(400).json({outcome:"error",message:strMessage})
    }
})

// deletes a job detail
app.delete("/api/jobdetails/:detailid",(req,res) => {
    let strDetailID = req.params.detailid
    const strQuery = "DELETE FROM tblJobDetails WHERE DetailID = ?"
    dbResume.run(strQuery,[strDetailID],function(err){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:"Detail deleted"})
        }
    })
})

// returns all skills
app.get("/api/skills",(req,res) => {
    const strQuery = "SELECT * FROM tblSkills"
    dbResume.all(strQuery,[],function(err,rows){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:rows})
        }
    })
})

// adds a new skill
app.post("/api/skills",(req,res) => {
    let strCategory = req.body.category ? req.body.category : ""
    let strSkillName = req.body.skillname ? req.body.skillname : ""

    strCategory = strCategory.trim()
    strSkillName = strSkillName.trim()

    let blnError = false
    let strMessage = ''

    if(strSkillName.length < 1){
        blnError = true
        strMessage += 'You must provide a skill name. '
    }

    if(blnError == false){
        let strSkillID = uuidv4()
        const strQuery = "INSERT INTO tblSkills VALUES (?,?,?)"
        dbResume.run(strQuery,[strSkillID,strCategory,strSkillName],function(err){
            if(err){
                res.status(500).json({outcome:"error",message:err.message})
            } else {
                res.status(201).json({outcome:"success",message:"Skill added"})
            }
        })
    } else {
        res.status(400).json({outcome:"error",message:strMessage})
    }
})

// deletes a skill
app.delete("/api/skills/:skillid",(req,res) => {
    let strSkillID = req.params.skillid
    const strQuery = "DELETE FROM tblSkills WHERE SkillID = ?"
    dbResume.run(strQuery,[strSkillID],function(err){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:"Skill deleted"})
        }
    })
})

// returns all certifications
app.get("/api/certifications",(req,res) => {
    const strQuery = "SELECT * FROM tblCertifications"
    dbResume.all(strQuery,[],function(err,rows){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:rows})
        }
    })
})

// adds a new certification
app.post("/api/certifications",(req,res) => {
    let strCertName = req.body.certname ? req.body.certname : ""
    let strIssuer = req.body.issuer ? req.body.issuer : ""
    let strDateEarned = req.body.dateearned ? req.body.dateearned : ""

    strCertName = strCertName.trim()
    strIssuer = strIssuer.trim()
    strDateEarned = strDateEarned.trim()

    let blnError = false
    let strMessage = ''

    if(strCertName.length < 1){
        blnError = true
        strMessage += 'You must provide a certification name. '
    }

    if(blnError == false){
        let strCertID = uuidv4()
        const strQuery = "INSERT INTO tblCertifications VALUES (?,?,?,?)"
        dbResume.run(strQuery,[strCertID,strCertName,strIssuer,strDateEarned],function(err){
            if(err){
                res.status(500).json({outcome:"error",message:err.message})
            } else {
                res.status(201).json({outcome:"success",message:"Certification added"})
            }
        })
    } else {
        res.status(400).json({outcome:"error",message:strMessage})
    }
})

// deletes a certification
app.delete("/api/certifications/:certid",(req,res) => {
    let strCertID = req.params.certid
    const strQuery = "DELETE FROM tblCertifications WHERE CertID = ?"
    dbResume.run(strQuery,[strCertID],function(err){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:"Certification deleted"})
        }
    })
})

// returns all awards
app.get("/api/awards",(req,res) => {
    const strQuery = "SELECT * FROM tblAwards"
    dbResume.all(strQuery,[],function(err,rows){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:rows})
        }
    })
})

// adds a new award
app.post("/api/awards",(req,res) => {
    let strAwardName = req.body.awardname ? req.body.awardname : ""
    let strIssuer = req.body.issuer ? req.body.issuer : ""
    let strDateEarned = req.body.dateearned ? req.body.dateearned : ""

    strAwardName = strAwardName.trim()
    strIssuer = strIssuer.trim()
    strDateEarned = strDateEarned.trim()

    let blnError = false
    let strMessage = ''

    if(strAwardName.length < 1){
        blnError = true
        strMessage += 'You must provide an award name. '
    }

    if(blnError == false){
        let strAwardID = uuidv4()
        const strQuery = "INSERT INTO tblAwards VALUES (?,?,?,?)"
        dbResume.run(strQuery,[strAwardID,strAwardName,strIssuer,strDateEarned],function(err){
            if(err){
                res.status(500).json({outcome:"error",message:err.message})
            } else {
                res.status(201).json({outcome:"success",message:"Award added"})
            }
        })
    } else {
        res.status(400).json({outcome:"error",message:strMessage})
    }
})

// deletes an award
app.delete("/api/awards/:awardid",(req,res) => {
    let strAwardID = req.params.awardid
    const strQuery = "DELETE FROM tblAwards WHERE AwardID = ?"
    dbResume.run(strQuery,[strAwardID],function(err){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:"Award deleted"})
        }
    })
})

// returns a setting by key
app.get("/api/settings/:key",(req,res) => {
    let strKey = req.params.key
    const strQuery = "SELECT * FROM tblSettings WHERE SettingKey = ?"
    dbResume.all(strQuery,[strKey],function(err,rows){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:rows})
        }
    })
})

// saves or updates a setting
app.post("/api/settings",(req,res) => {
    let strKey = req.body.key ? req.body.key : ""
    let strValue = req.body.value ? req.body.value : ""

    strKey = strKey.trim()
    strValue = strValue.trim()

    if(strKey.length < 1){
        res.status(400).json({outcome:"error",message:"Setting key is required"})
        return
    }

    const strQuery = "INSERT OR REPLACE INTO tblSettings VALUES (?,?)"
    dbResume.run(strQuery,[strKey,strValue],function(err){
        if(err){
            res.status(500).json({outcome:"error",message:err.message})
        } else {
            res.status(200).json({outcome:"success",message:"Setting saved"})
        }
    })
})

// sends text to gemini api for ai suggestions
app.post("/api/gemini",(req,res) => {
    let strText = req.body.text ? req.body.text : ""
    let strType = req.body.type ? req.body.type : "general"

    strText = strText.trim()

    if(strText.length < 1){
        res.status(400).json({outcome:"error",message:"Text is required"})
        return
    }

    // checks .env first, then database for api key
    let strApiKey = process.env.GEMINI_API_KEY || ""

    dbResume.all("SELECT * FROM tblSettings WHERE SettingKey = 'gemini_api_key'",[],function(err,rows){
        if(rows && rows.length > 0 && rows[0].SettingValue.length > 0){
            strApiKey = rows[0].SettingValue
        }

        if(strApiKey.length < 1 || strApiKey == "your-api-key-here"){
            res.status(400).json({outcome:"error",message:"No Gemini API key configured. Please add your API key in Settings."})
            return
        }

        // builds prompt based on type
        let strPrompt = ""
        if(strType == "job"){
            strPrompt = "You are a professional resume writer. Review this job responsibility/detail and suggest improvements to make it more impactful for a resume. Use strong action verbs and quantify results where possible. Keep it to one concise bullet point. Only return the improved text, nothing else. Here is the text: " + strText
        } else if(strType == "summary"){
            strPrompt = "You are a professional resume writer. Review this professional summary and suggest improvements to make it more compelling. Keep it to 2-3 sentences. Only return the improved text, nothing else. Here is the text: " + strText
        } else {
            strPrompt = "You are a professional resume writer. Review this text and suggest improvements for a resume. Only return the improved text, nothing else. Here is the text: " + strText
        }

        const strUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${strApiKey}`

        fetch(strUrl,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                contents:[{parts:[{text:strPrompt}]}]
            })
        })
        .then(result => {
            return result.json()
        })
        .then(data => {
            if(data.candidates && data.candidates.length > 0){
                let strSuggestion = data.candidates[0].content.parts[0].text
                res.status(200).json({outcome:"success",message:strSuggestion})
            } else {
                res.status(500).json({outcome:"error",message:"No suggestion returned from Gemini"})
            }
        })
        .catch(err => {
            res.status(500).json({outcome:"error",message:"Gemini API error: " + err.message})
        })
    })
})

// returns all resume data for building the resume
app.get("/api/resume",(req,res) => {
    let objResume = {}

    dbResume.all("SELECT * FROM tblUserInfo LIMIT 1",[],function(err,userRows){
        objResume.user = userRows || []

        dbResume.all("SELECT * FROM tblJobs",[],function(err,jobRows){
            objResume.jobs = jobRows || []

            dbResume.all("SELECT * FROM tblJobDetails",[],function(err,detailRows){
                objResume.jobdetails = detailRows || []

                dbResume.all("SELECT * FROM tblSkills",[],function(err,skillRows){
                    objResume.skills = skillRows || []

                    dbResume.all("SELECT * FROM tblCertifications",[],function(err,certRows){
                        objResume.certifications = certRows || []

                        dbResume.all("SELECT * FROM tblAwards",[],function(err,awardRows){
                            objResume.awards = awardRows || []
                            res.status(200).json({outcome:"success",message:objResume})
                        })
                    })
                })
            })
        })
    })
})
