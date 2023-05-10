import { LightningElement, api, wire, track } from 'lwc';
import getQuestions from '@salesforce/apex/SurveyController.getQuestions';
import getQuestionChoices from '@salesforce/apex/SurveyController.getQuestionChoices';
import saveFeedback from '@salesforce/apex/SurveyController.saveFeedback';

export default class SurveyFeedbackLwc extends LightningElement {
    @api surveyId;
    @track questions;
    @track selectedAnswers = new Map();
    @track error;

    //get survey questions
    @wire(getQuestions, { surveyId: '$surveyId' })
    wiredQuestions({ error, data }) {
        if (data) {
            this.questions = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.questions = undefined;
        }
    }

    //get question choices
    getQuestionChoices(questionId) {
        getQuestionChoices({ questionId: questionId })
            .then(result => {
                const questionChoices = result;
                this.questionChoices.set(questionId, questionChoices);
            })
            .catch(error => {
                this.error = error;
            });
    }

    //handle change
    handleChange(event) {
        let selectedAnswer = event.detail.value;
        let questionId = event.target.name;
        this.selectedAnswers.set(questionId, selectedAnswer);
    }

    //handle submit
    handleSubmit() {
        let surveyResponse = {
            surveyId: this.surveyId,
            answers: Array.from(this.selectedAnswers)
        };
        saveFeedback({ surveyResponse })
            .then(result => {
                console.log('Survey response saved successfully.');
            })
            .catch(error => {
                this.error = error;
            });
    }
}