import { TemplateAppearanceModel, TemplateSenderModel, TemplateRelevancyModel, TemplateBehaviorModel } from './template.model'

export class Recommendations {
    recommendations_uuid: string;
    name: string;
    description: string;
    deception_level: number;

    // Deception Scores
    appearance: TemplateAppearanceModel;
    grammar: number;
    link_domain: number;
    logo_graphics: number;

    sender: TemplateSenderModel;
    external: number;
    internal: number;
    authoritative: number;

    relevancy: TemplateRelevancyModel;
    organization: number;
    public_news: number;

    behavior: TemplateBehaviorModel;
    fear: number;
    duty_obligation: number;
    curiosity: number;
    greed: number;

    // Database tracking variables
    created_by?: string;
    cb_timestamp?: Date;
    last_updated_by?: string;
    lub_timestamp?: Date;

    public constructor(init?: Partial<Recommendations>) {
        Object.assign(this, init);
    }
}