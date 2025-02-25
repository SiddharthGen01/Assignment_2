import express, { Request, Response, Application } from 'express';
import { ApplicationData } from './application';
import { XMLParser } from 'fast-xml-parser';
import { create } from 'xmlbuilder2';
require('dotenv').config();

const createRequest = (
  includes: boolean,
  expands: boolean,
  page: number,
  size: number
) => {
  const docString = `<?xml version="1.0" encoding="UTF-8"?>
  <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <env:Header>
      <wsse:Security env:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
        <wsse:UsernameToken wsu:Id="UsernameToken-86F2FCCEFFBB80C4CD14820998755791">
          <wsse:Username>${process.env.USER_NAME}</wsse:Username>
          <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${process.env.PASSWORD}</wsse:Password>
        </wsse:UsernameToken>
      </wsse:Security>
    </env:Header>
    <env:Body>
      <bsvc:Get_Candidates_Request xmlns:bsvc="urn:com.workday/bsvc" bsvc:version="${process.env.VERSION}">
      <bsvc:Response_Filter>
        <bsvc:Page>${page}</bsvc:Page>
        <!-- Optional: -->
        <bsvc:Count>${size}</bsvc:Count>
      </bsvc:Response_Filter> 
      <bsvc:Response_Group>
        <!-- Optional: -->
        <bsvc:Include_Reference>${includes}</bsvc:Include_Reference>
        <!-- Optional: -->
        <bsvc:Exclude_All_Attachments>${expands}</bsvc:Exclude_All_Attachments>
      </bsvc:Response_Group>
      </bsvc:Get_Candidates_Request>
    </env:Body>
  </env:Envelope>`;
  return docString;
};

const createGetCandidateRequest = (
  candidateId: string,
  includes: boolean,
  expands: boolean
) => {
  const docString = `<?xml version="1.0" encoding="UTF-8"?>
  <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <env:Header>
      <wsse:Security env:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
        <wsse:UsernameToken wsu:Id="UsernameToken-86F2FCCEFFBB80C4CD14820998755791">
          <wsse:Username>${process.env.USER_NAME}</wsse:Username>
          <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${process.env.PASSWORD}</wsse:Password>
        </wsse:UsernameToken>
      </wsse:Security>
    </env:Header>
    <env:Body>
      <bsvc:Get_Candidates_Request xmlns:bsvc="urn:com.workday/bsvc" bsvc:version="${process.env.VERSION}">
        <bsvc:Request_References bsvc:Skip_Non_Existing_Instances="false">
          <!-- 1 or more repetitions: -->
          <bsvc:Candidate_Reference>
          <!-- Zero or more repetitions: -->
            <bsvc:ID bsvc:type="Candidate_ID">${candidateId}</bsvc:ID>
          </bsvc:Candidate_Reference>
        </bsvc:Request_References>
        <bsvc:Response_Group>
          <!-- Optional: -->
          <bsvc:Include_Reference>${includes}</bsvc:Include_Reference>
          <!-- Optional: -->
          <bsvc:Exclude_All_Attachments>${expands}</bsvc:Exclude_All_Attachments>
        </bsvc:Response_Group>
      </bsvc:Get_Candidates_Request>
    </env:Body>
  </env:Envelope>`;
  return docString;
};

const app: Application = express();
const port = process.env.PORT;

// const getCandidatesUrl = 'https://run.mocky.io/v3/983ddb91-7612-4f87-9417-a9e0a9eb9fc2';
// const testUrl = 'https://run.mocky.io/v3/96674f3f-6515-4ad6-8c08-cc091fab45ca';
const getCandidatesUrl = 'https://wd2-impl-services1.workday.com/ccx/service/zktechnology_pt1/Recruiting';
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

const getCandidatesData = async(page: number, size: number, include: boolean, expands: boolean) => {
  try {
     const doc = createRequest(include, !expands, page, size);
     const xmlBody = doc;
     console.log("xml body: ", xmlBody);
 
     const requestOptions = {
       method: 'POST',
       headers: {
         'Content-Type': 'application/xml',
       },
       body: xmlBody
     };
 
     const response = await fetch(getCandidatesUrl, requestOptions);
     
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlString = await response.text();
    const jsonData = parserXmlToJson(xmlString);
    return jsonData?.Envelope?.Body?.Get_Candidates_Response?.Response_Data?.Candidate;
  } catch(error) {
    console.log("Getting the error: ", error);
  }
}

const getCandidateData = async(candidateId: string, include: boolean, expands: boolean) => {
  try {
      const doc = createGetCandidateRequest(candidateId, include, !expands);
      const xmlBody = doc;
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xmlBody
      };

      const response = await fetch(getCandidatesUrl, requestOptions);

      if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlString = await response.text();
      const jsonData = parserXmlToJson(xmlString);
      return jsonData?.Envelope?.Body?.Get_Candidates_Response?.Response_Data?.Candidate;
  } catch(error) {
    console.log("Getting the error: ", error);
  }
}

app.get('/get', async (req: Request, res: Response) => {
  try {
    const id = (req.query.id as string) || 'string';
    const ids = atob(id).split("__");
    const applicationId = ids[0];
    const candidateId = ids[1];
    const include = req.query.include === 'questionnaires';
    const expands = req.query.expand === 'documents';
    const data = await getCandidateData(candidateId, include, expands);
    if (data) {
      const candidateData = data?.Candidate_Data;
      const jobApplicationData = candidateData?.Job_Application_Data;
      jobApplicationData.forEach((jobApplication: any) => {
        const jobAppId = jobApplication?.Job_Applied_To_Data?.Job_Application_ID;
        if (applicationId === jobAppId) { 
          const candidate_id = candidateId;
          const job_id = jobApplication?.Job_Applied_To_Data?.Job_Requisition_Reference?.ID?.[1]?.["#text"];
          const interview_stage_id = jobApplication?.Job_Applied_To_Data?.Stage_Reference?.ID?.[0]?.["#text"];
          const interview_stage_name = jobApplication?.Job_Applied_To_Data?.Stage_Reference?.ID?.[1]?.["#text"];
          const source = jobApplication?.Job_Applied_To_Data?.Source_Reference?.ID?.[1]?.["#text"];
          const created_at = jobApplication?.Job_Applied_To_Data?.Job_Application_Date;
          const updated_at = jobApplication?.Job_Applied_To_Data?.Status_Timestamp;
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
            source,
            created_at,
            updated_at
          };
          if (include) {
            applicationData.questionnaires = [{id: null, answers: null}];
          }
          if (expands) {
            applicationData.documents = [{id: null, name: null, path: null, type: null, category: null, category_id: null, contents: null, created_at: null, updated_at: null, file_format: null}];
          }
          res.send(applicationData);
        }
      });
    }
    res.status(404).send(`No application found with ${atob(id)}`);
  } catch (error) {
    console.log('error: ', error);
  }
});

app.get('/list', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 20;
    const include = req.query.include === 'questionnaires';
    const expands = req.query.expand === 'documents';
    const data = await getCandidatesData(page, size, include, expands);
    const result: ApplicationData[] = [];
    data.forEach((candidate: any) => {
      const candidateData = candidate?.Candidate_Data;
      const jobApplicationData = candidateData?.Job_Application_Data?.[0]?.Job_Applied_To_Data;
      const compositeId = jobApplicationData?.Job_Application_ID + "__" + candidateData?.Candidate_ID;
      const id = btoa(compositeId);
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
        source,
        created_at,
        updated_at
      };

      if (include) {
        applicationData.questionnaires = [{id: null, answers: null}];
      }
      
      if (expands) {
        applicationData.documents = [{id: null, name: null, path: null, type: null, category: null, category_id: null, contents: null, created_at: null, updated_at: null, file_format: null}];
      }
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

