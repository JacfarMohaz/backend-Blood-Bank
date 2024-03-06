const nodemailer = require("nodemailer")
const donorsModel = require("../Model/DonorsModel")
const sentEmailsModel = require("../Model/SendsEmailsModel") 

// Configure Nodemailer transporter
const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "jacfarmahamed77@gmail.com",
        pass: "uczdltneeslhvjqa"
    }
})

// read donors emails
const ReadEmailAPlas = async () => {
    try {
        // Find donors with blood type A+
        const getDonors = await donorsModel.find({ bloodType: { $eq: "AB+" } }, { email: 1 })
        if (getDonors.length > 0) {
            return getDonors.map(donorsModel => donorsModel.email)
        }
    } catch (error) {
        console.log(error)
    }
}

// Function to send email to a single recipient
const sendEmailABPlas = async (req, res) => {
    // Get the array of donor emails
    const donorEmails = await ReadEmailAPlas()
    // Check if the array is not empty
    if (donorEmails && donorEmails.length > 0) {
        // Join the array elements with commas to form a string of recipients
        const recipients = donorEmails.join(",")
        // Send the email to the recipients
        const info = await transport.sendMail({
            from: "jacfarmahamed77@gmail.com",
            to: recipients,
            subject: req.body.subject,
            text: req.body.text
        })
        // console.log("Email ka waala diray ", info.messageId)
        if (info) {
            // Loop through the donor emails
            for (let email of donorEmails) {
                // Find the donor document by email
                const donor = await donorsModel.findOne({ email: email })
                // Check if the donor exists
                if (donor) {
                    // Get the blood type from the donor document
                    const bloodType = donor.bloodType

                    // Store the email content and recipient information in the new collection
                    const sentEmail = new sentEmailsModel({
                        to: email,
                        subject: req.body.subject,
                        text: req.body.text,
                        bloodType: bloodType,
                        userName: req.body.userName
                    })
                    await sentEmail.save() // Save the document to the database
                    // console.log("Saved the email content")
                }
            }
            res.send("Email has sent successfully")
        }
    } else {
        // Handle the case when there are no donors
        // console.log("No donors found")
        res.send("No donors found")
    }
}

module.exports = sendEmailABPlas
