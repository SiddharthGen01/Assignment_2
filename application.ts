import { Documents } from "./document";
import { InterviewStage } from "./interview-stage";
import { Questionnaries } from "./questionnaries";
import { RejectedReasons } from "./rejected-reasons";

export interface ApplicationData {
    id: string | null;
    candidate_id: string | null;
    job_id: string | null;
    interview_stage: InterviewStage | null;
    interview_stage_id: string | null;
    rejected_reason_ids: string[] | null;
    rejected_reasons: RejectedReasons | null;
    rejected_at: Date | null;
    location_ids: string[] | null;
    status: string | null;
    questionnaires?: Questionnaries[] | null;
    source: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    documents?: Documents[] | null;
}