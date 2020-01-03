module.exports = (logger, publicApiKey, privateApiKey) => {

    let mailjet = require("node-mailjet").connect(publicApiKey, privateApiKey);

    const waitJob = async jobId => {
        logger.debug(`Waiting for job ${jobId} to complete`);
        return new Promise((resolve, reject) => {

            let retries = 0;

            const retry = (delay, maxRetries) => {
                mailjet
                .get("contact")
                .action("managemanycontacts")
                .id(jobId)
                .request((error, response) => {
                    let body = response.body;
                    if (error || body.Data[0].Error || retries > maxRetries) {
                        reject(error || body.Data[0].Error || new Error("maxRetries limit reached!"));
                    } else {
                        let data = body.Data[0];
                        if (data.Status === "Completed") {
                            logger.debug(`Job ${jobId} is completed`);
                            resolve();
                        } else {
                            retries++;
                            logger.debug(`Job ${jobId} is not completed`);
                            setTimeout(() => retry(jobId), delay);
                        }
                    }
                });
            };

            retry(5000, 10);
        });
    };

    const getTemplateContent = async templateId => {
        let response = await mailjet
        .get("template")
        .id(templateId)
        .action("detailcontent")
        .request();

        return response.body.Data[0];
    };

    return {

        createContactMetadata: async () => {
            logger.info(`Creating contacts metadata...`);

            let metadata = [
                { Name: "prenom", Datatype: "str", NameSpace: "static" },
                { Name: "nom", Datatype: "str", NameSpace: "static" },
                { Name: "formation_intitule", Datatype: "str", NameSpace: "static" },
                { Name: "organisme_formateur_raison_sociale", Datatype: "str", NameSpace: "static" },
                { Name: "session_periode_debut", Datatype: "datetime", NameSpace: "static" },
                { Name: "session_periode_fin", Datatype: "datetime", NameSpace: "static" },
            ];

            return Promise.all(metadata.map(m => {
                return mailjet
                .post("contactmetadata")
                .request(m);
            }));
        },

        createContacts: async (name, emails) => {
            logger.info(`Creating contacts ${name}...`);

            let response = await mailjet
            .post("contactslist")
            .request({
                "Name": name,
            });

            let contactListId = response.body.Data[0].ID;

            response = await mailjet
            .post("contact")
            .action("managemanycontacts")
            .request({
                "ContactsLists": [{
                    "ListID": contactListId,
                    "Action": "addforce",
                }],
                "Contacts": emails.map(({ trainee, training }) => {
                    return {
                        "Email": trainee.email,
                        "Name": `${trainee.firstName} ${trainee.name}`,
                        "IsExcludedFromCampaigns": false,
                        "Properties": {
                            prenom: trainee.firstName,
                            nom: trainee.name,
                        },
                    };
                }),
            });

            await waitJob(response.body.Data[0].JobID);

            return contactListId;
        },

        createCampaign: async (name, contactListId, templateId) => {
            let response = await mailjet
            .post("campaigndraft")
            .request({
                "Locale": "fr_FR",
                "Title": name,
                "ContactsListID": contactListId,
                "Subject": "Donnez votre avis",
                "Sender": 32595,
                "SenderName": "Anotea",
                "SenderEmail": "anotea.pe@gmail.com",
                "ReplyEmail": "anotea.pe@gmail.com",
                "TemplateID": templateId,
                "EditMode": "tool2",
            });

            let campaignId = response.body.Data[0].ID;
            let templateContent = await getTemplateContent(templateId);

            await mailjet
            .post("campaigndraft")
            .id(campaignId)
            .action("detailcontent")
            .request(templateContent);

            return campaignId;
        },

        sendCampaign: (campaignId, options = {}) => {
            return mailjet
            .post("campaigndraft")
            .id(campaignId)
            .action(options.dryRun ? "test" : "send")
            .request(options.dryRun ? {
                "Recipients": [
                    {
                        "Email": "bguerout@gmail.com",
                        "Name": "Mailjet"
                    }
                ]
            } : {});
        },
    };
};
