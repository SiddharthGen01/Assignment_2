import express, { Request, Response, Application } from 'express';
import { ApplicationData } from './application';
import { XMLParser } from 'fast-xml-parser';

const app: Application = express();
const port = process.env.PORT || 3000;

const getCandidatesUrl = 'https://run.mocky.io/v3/983ddb91-7612-4f87-9417-a9e0a9eb9fc2';
const getInterviewsUrl = 'https://run.mocky.io/v3/b82d3a87-798b-4ab4-b3b3-b1e252314e82';
const getInterviewerFeedbackUrl = 'https://run.mocky.io/v3/0532d2e6-4de1-4281-bd82-15b9799ac078';
const getJobRequisitionsUrl = 'https://run.mocky.io/v3/8d427219-6329-4126-85a4-680e798edd88';

const options = {
  ignoreAttributes: false,
  removeNSPrefix: true
};

const parserXmlToJson = (xmlString: string) => {
  const parser = new XMLParser(options);
  const jsonOutput = parser.parse(xmlString);
  return jsonOutput;
};

const getCandidatesData = async() => {
  try {
    const xmlResponse = await fetch(getCandidatesUrl);
    const xmlString = await xmlResponse.text();
    const jsonData = parserXmlToJson(xmlString);
    return jsonData?.Envelope?.Body?.Get_Candidates_Response?.Response_Data?.Candidate;
  } catch(error) {
    console.log("Getting the error: ", error);
  }
}

const getInterviewsData = async() => {
  try {
    const xmlResponse = await fetch(getInterviewsUrl);
    const xmlString = await xmlResponse.text();
    const jsonData = parserXmlToJson(xmlString);
    return jsonData?.Envelope?.Body?.Get_Interviews_Response?.Response_Data?.Interview;
  } catch(error) {
    console.log("Getting the error: ", error);
  }
}

const getInterviewsFeedbackData = async() => {
  try {
    const xmlResponse = await fetch(getInterviewerFeedbackUrl);
    const xmlString = await xmlResponse.text();
    const jsonData = parserXmlToJson(xmlString);
    return jsonData?.Envelope?.Body?.Get_Interview_Feedbacks_Response?.Response_Data?.Interview_Feedback;
  } catch(error) {
    console.log("Getting the error: ", error);
  }
}

const getJobRequisitionsData = async() => {
  try {
    const xmlResponse = await fetch(getJobRequisitionsUrl);
    const xmlString = await xmlResponse.text();
    const jsonData = parserXmlToJson(xmlString);
    return jsonData?.Envelope?.Body?.Get_Job_Requisitions_Response?.Response_Data?.Job_Requisition;
  } catch(error) {
    console.log("Getting the error: ", error);
  }
}

app.get('/get/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const data = await getCandidatesData();
    data.forEach((candidate: any) => {
      const candidateData = candidate?.Candidate_Data;
      const jobApplicationData = candidateData?.Job_Application_Data?.[0]?.Job_Applied_To_Data;
      const id = jobApplicationData?.Job_Application_ID;
      if (applicationId === id) { 
        const candidate_id = candidateData?.Candidate_ID;
        const job_id = jobApplicationData?.Job_Requisition_Reference?.ID?.[1]?.["#text"];
        const interview_stage_id = jobApplicationData?.Stage_Reference?.ID?.[0]?.["#text"];
        const interview_stage_name = jobApplicationData?.Stage_Reference?.ID?.[1]?.["#text"];
        const source = jobApplicationData?.Source_Reference?.ID?.[1]?.["#text"];
        const created_at = jobApplicationData?.Job_Application_Date;
        const updated_at = jobApplicationData?.Status_Timestamp;
        const applicationData: ApplicationData = {
          id,
          candidate_id,
          job_id,
          interview_stage: {id: interview_stage_id, name: interview_stage_name, order: null},
          interview_stage_id: interview_stage_id,
          rejected_reason_ids: null,
          rejected_reasons: null,
          rejected_at: null,
          location_ids: null,
          status: interview_stage_name,
          questionnaires: [{id: null, answers: null}],
          source,
          created_at,
          updated_at,
          documents: [{id: null, name: null, path: null, type: null, category: null, category_id: null, contents: null, created_at: null, updated_at: null, file_format: null}]
        };
        return res.send(applicationData);
      }
    });
    res.status(404).send(`No application found with ${applicationId}`);
  } catch (error) {
    console.log('error: ', error);
  }
});

app.get('/list', async (req: Request, res: Response) => {
  try {
    const data = await getCandidatesData();
    const result: ApplicationData[] = [];
  
    data.forEach((candidate: any) => {
      const candidateData = candidate?.Candidate_Data;
      const jobApplicationData = candidateData?.Job_Application_Data?.[0]?.Job_Applied_To_Data;
      const id = jobApplicationData?.Job_Application_ID;
      const candidate_id = candidateData?.Candidate_ID;
      const job_id = jobApplicationData?.Job_Requisition_Reference?.ID?.[1]?.["#text"];
      const interview_stage_id = jobApplicationData?.Stage_Reference?.ID?.[0]?.["#text"];
      const interview_stage_name = jobApplicationData?.Stage_Reference?.ID?.[1]?.["#text"];
      const source = jobApplicationData?.Source_Reference?.ID?.[1]?.["#text"];
      const created_at = jobApplicationData?.Job_Application_Date;
      const updated_at = jobApplicationData?.Status_Timestamp;
      
      const applicationData: ApplicationData = {
        id,
        candidate_id,
        job_id,
        interview_stage: {id: interview_stage_id, name: interview_stage_name, order: null},
        interview_stage_id: interview_stage_id,
        rejected_reason_ids: null,
        rejected_reasons: null,
        rejected_at: null,
        location_ids: null,
        status: interview_stage_name,
        questionnaires: [{id: null, answers: null}],
        source,
        created_at,
        updated_at,
        documents: [{id: null, name: null, path: null, type: null, category: null, category_id: null, contents: null, created_at: null, updated_at: null, file_format: null}]
      };
      result.push(applicationData);
    });
    res.send(result);
  } catch (error) {
    console.log('error: ', error);
  }
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

