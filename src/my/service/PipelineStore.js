// @flow

import idgen from './IdGenerator';
import type {PipelineNamedValueDescriptor, PipelineValueDescriptor} from "./PipelineSyntaxConverter";
// import type { PipelineKeyValuePair } from './PipelineSyntaxConverter';
// import { DragPosition } from '../components/editor/DragPosition';

/**
 * A stage in a pipeline
 */
export type StageInfo = {
    name: string,
    id: number,
    // eslint-disable-next-line no-use-before-define
    children: Array<StageInfo | UnknownSection>,
    // eslint-disable-next-line no-use-before-define
    steps: StepInfo[],
    // eslint-disable-next-line no-use-before-define
    environment: EnvironmentEntryInfo[],
    // eslint-disable-next-line no-use-before-define
    agent: StepInfo,
    post: PostInfo[],
    when: WhenInfo[],
};

export type WhenInfo={
    name: string,
    children?: WhenInfo[],
    arguments?: string | KeyValueInfo[],
};

export type KeyValueInfo={
    key:string,
    value:string,
};

export type PostInfo={
    condition:string,
    steps: StepInfo[],
};

export type EnvironmentEntryInfo ={
           id: number,
           key:string,
           value:string,
      };

/**
 * An individual step within a single pipeline stage
 */
export type StepInfo = {
    id: number,
    name: string,
    label: string,
    isContainer: boolean,
    children: StepInfo[],
    data: any,
};

export type PipelineInfo = StageInfo;

export class UnknownSection {
    prop: string;
    json: any;
    constructor(prop: string, json: any) {
        this.prop = prop;
        this.json = json;
    }
}

// eslint-disable-next-line no-unused-vars
function _copy<T>(obj: T): ?T {
    if (!obj) {
        return null;
    }
    // TODO: This is awful, use a lib
    return JSON.parse(JSON.stringify(obj));
}

function createStage(name: string): StageInfo {
    return {
        name,
        agent: {
            type: 'none', // default to no agent
            arguments: [],
        },
        id: idgen.next(),
        children: [],
        steps: [],
    };
}

/**
 * Search through candidates (and their children, recursively) to see if any is the parent of the stage
 */
function findParentStage(container: StageInfo, childStage: StageInfo, safetyValve: number = 5): ?StageInfo {
    // TODO: TESTS
    if (!container || !container.children || container.children.length === 0 || safetyValve < 1) {
        return null;
    }

    for (const child of container.children) {
        if (child.id === childStage.id) {
            return container;
        }

        const foundParent = findParentStage(child, childStage, safetyValve - 1);

        if (foundParent) {
            return foundParent;
        }
    }

    return null;
}

const findStepById = function(steps, id) {
    const step = steps.filter(i => i.id === id);
    if (step.length) {
        return step[0];
    }
    for (let s of steps) {
        if (s.isContainer) {
            const children = s.children;
            if (children) {
                const childStep = findStepById(children, id);
                if (childStep) {
                    return childStep;
                }
            }
        }
    }
};

/**
 * Returns the stage that contains the provided step or undefined
 * if none found
 */
const findStageByStep = function(stage, step) {
    // Does this stage contain this step directly?
    if (stage.steps && stage.steps.length > 0) {
        for (const s of stage.steps) {
            if (s === step) {
                return stage;
            }
        }
        // or is this a nested step?
        const parentStep = findParentStepByChild(stage.steps, step);
        if (parentStep) {
            return stage;
        }
    }

    // try child stages
    if (stage.children && stage.children.length > 0) {
        for (const child of stage.children) {
            const childStage = findStageByStep(child, step);
            if (childStage) {
                return childStage;
            }
        }
    }
};

const findParentStepByChild = function(steps, childStep) {
    for (let s of steps) {
        if (s.isContainer) {
            const children = s.children;
            if (children) {
                for (let c of children) {
                    if (c.id === childStep.id) {
                        return s;
                    }
                }
                const nestedStep = findParentStepByChild(children, childStep);
                if (nestedStep) {
                    return nestedStep;
                }
            }
        }
    }
};

const STAGE_NO_COPY_KEYS = ['id', 'name'];

/**
 * Copies properties from one stage to another
 * @param fromStage
 * @param toStage
 */
const moveStageProperties = function(fromStage, toStage) {
    for (const key of Object.keys(fromStage)) {
        if (STAGE_NO_COPY_KEYS.indexOf(key) === -1) {
            toStage[key] = fromStage[key];
            delete fromStage[key];
        }
    }
};

// TODO: mobxify
class PipelineStore {
    pipeline: StageInfo;
    listeners: Function[] = [];
    currentStage:StageInfo;
    currentStageType:string;

    createAnyStage(name: string): StageInfo {
        return {
            name,
            agent: {
                type: 'any', // default to no agent
                arguments: [],
            },
            id: idgen.next(),
            children: [],
            steps: [],
        };
    }
    addSequentialStage(stage: StageInfo) {
        const { pipeline } = this;
        pipeline.children = [...pipeline.children, stage];
        this.currentStage=stage;
        this.currentStageType="sequential";
        this.notify();
        return stage;
    }

    addParallelStage(newStage: StageInfo) {
        if(this.currentStageType!=="parallel"){
            this.currentStageType="parallel";
            let parentStage=this.createAnyStage(newStage.name);
            parentStage.children=[];
            this.currentStage=parentStage;
            const { pipeline } = this;
            pipeline.children = [...pipeline.children, parentStage];
        }

        this.currentStage.children.push(newStage);

        this.notify();
        return newStage;
    }

    createSequentialStage(name: string) {
        const { pipeline } = this;

        let newStage = createStage(name);
        // eslint-disable-next-line no-unused-vars
        const stageId = newStage.id;

        pipeline.children = [...pipeline.children, newStage];
        this.notify();
        return newStage;
    }

    createParallelStage(name: string, parentStage: StageInfo) {
        let updatedChildren = [...parentStage.children]; // Start with a shallow copy, we'll add one or two to this

        let newStage = createStage(name);

        if (parentStage.children.length === 0) {
            // Converting a normal stage with steps into a container of parallel branches, so there's more to do
            let zerothStage = createStage(parentStage.name);

            // Move all properties steps from the parent stage into the new zeroth stage
            moveStageProperties(parentStage, zerothStage);
            parentStage.steps = []; // Stages with children can't have steps

            updatedChildren.push(zerothStage);
        }

        updatedChildren.push(newStage); // Add the user's newStage to the parent's child list

        parentStage.children = updatedChildren;
        this.notify();
        return newStage;
    }

    findParentStage(stage: StageInfo) {
        return findParentStage(this.pipeline, stage);
    }

    findStageByStep(step: StepInfo): ?StageInfo {
        const stage = findStageByStep(this.pipeline, step);
        return stage;
    }

    findParentStep(childStep: StepInfo): ?StepInfo {
        const stage = findStageByStep(this.pipeline, childStep);
        if (!stage) {
            throw new Error('Stage not found');
        }
        const parent = findParentStepByChild(stage.steps, childStep);
        return parent;
    }

    /**
     * Return an array that starts at the specified step and includes all ancestor steps.
     * @param childStep
     * @param steps
     * @returns {[]}
     */
    findStepHierarchy(childStep: StepInfo, steps) {
        const ancestors = [childStep];

        let nextStep = childStep;

        while (nextStep) {
            nextStep = findParentStepByChild(steps, nextStep);

            if (nextStep) {
                ancestors.push(nextStep);
            }
        }

        return ancestors;
    }

    /**
     * Delete the selected stage from our stages list. When this leaves a single-branch of parallel jobs, the steps
     * will be moved to the parent stage, and the lone parallel branch will be deleted.
     *
     * Assumptions:
     *      * The Graph is valid, and contains selectedStage
     *      * Only top-level stages can have children (ie, graph is max depth of 2).
     */
    deleteStage(stage: StageInfo) {
        const parentStage = this.findParentStage(stage) || this.pipeline;

        // For simplicity we'll just copy the stages list and then mutate it
        // eslint-disable-next-line no-unused-vars
        let newStages = [...parentStage.children];

        // First, remove selected stage from parent list
        let newChildren = [...parentStage.children];
        let idx = newChildren.indexOf(stage);
        newChildren.splice(idx, 1);

        // see if this is a nested stage and we need to move a parallel to a single top-level
        if (parentStage !== this.pipeline && newChildren.length === 1) {
            let onlyChild = newChildren[0];
            newChildren = [];
            moveStageProperties(onlyChild, parentStage);
            parentStage.name = onlyChild.name;
        }

        // Update the parent with new children list
        parentStage.children = newChildren;

        this.notify();
    }

    addOldWhen(selectedStage: StageInfo,when:WhenInfo):WhenInfo{
        if (!selectedStage) {
            throw new Error('Must provide a stage to add steps');
        }
        let newWhensForStage = selectedStage.when || [];

        newWhensForStage=[...newWhensForStage,when];

        selectedStage.when=newWhensForStage;
        this.notify();
        return when;
    }

    addOldPost(selectedStage: StageInfo, post: any):PostInfo{
        if (!selectedStage) {
            throw new Error('Must provide a stage to add steps');
        }

        const oldPostsForStage = selectedStage.post || [];
        let newPostsForStage = oldPostsForStage;

        newPostsForStage = [...newPostsForStage, post];

        selectedStage.post = newPostsForStage;
        this.notify();
        return post;
    }

    addOldStepToPost(selectedPost: PostInfo, step: any): StepInfo {
        if (!selectedPost) {
            throw new Error('Must provide a post to add steps');
        }

        const oldStepsForPost = selectedPost.steps || [];
        let newStepsForPost = oldStepsForPost;

        newStepsForPost = [...newStepsForPost, step];

        selectedPost.steps = newStepsForPost;
        this.notify();
        return step;
    }
    addOldStep(selectedStage: StageInfo, parentStep: StepInfo, step: any): StepInfo {
        if (!selectedStage) {
            throw new Error('Must provide a stage to add steps');
        }

        const oldStepsForStage = selectedStage.steps || [];
        let newStepsForStage = oldStepsForStage;

        if (parentStep != null) {
            const parent = findStepById(oldStepsForStage, parentStep.id);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(step);
            } else {
                throw new Error('unable to find step: ' + parentStep.id);
            }
        } else {
            newStepsForStage = [...oldStepsForStage, step];
        }

        selectedStage.steps = newStepsForStage;
        this.notify();
        return step;
    }

    addStep(selectedStage: StageInfo, parentStep: StepInfo, step: any): StepInfo {
        if (!selectedStage) {
            throw new Error('Must provide a stage to add steps');
        }

        const oldStepsForStage = selectedStage.steps || [];
        let newStepsForStage = oldStepsForStage;

        let newStep: StepInfo = {
            id: idgen.next(),
            isContainer: step.isBlockContainer,
            children: [],
            name: step.functionName,
            label: step.displayName,
            data: {},
        };

        if (parentStep != null) {
            const parent = findStepById(oldStepsForStage, parentStep.id);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(newStep);
            } else {
                throw new Error('unable to find step: ' + parentStep.id);
            }
        } else {
            newStepsForStage = [...oldStepsForStage, newStep];
        }

        selectedStage.steps = newStepsForStage;
        this.notify();
        return newStep;
    }

    deleteStep(step: StepInfo) {
        const selectedStage = findStageByStep(this.pipeline, step);
        const oldStepsForStage = selectedStage.steps || [];
        let newStepsForStage = oldStepsForStage;
        // eslint-disable-next-line no-unused-vars
        let newSelectedStep;

        const parent = findParentStepByChild(selectedStage.steps, step);
        if (parent) {
            const stepIdx = parent.children.indexOf(step);

            if (stepIdx < 0) {
                return;
            }

            parent.children = [...parent.children.slice(0, stepIdx), ...parent.children.slice(stepIdx + 1)];

            newSelectedStep = parent;
        } else {
            // no parent
            const stepIdx = oldStepsForStage.indexOf(step);

            if (stepIdx < 0) {
                return;
            }

            selectedStage.steps = [...oldStepsForStage.slice(0, stepIdx), ...oldStepsForStage.slice(stepIdx + 1)];

            let newSelectedStepIdx = Math.min(stepIdx, newStepsForStage.length - 1);
            newSelectedStep = newStepsForStage[newSelectedStepIdx];
        }
        this.notify();
    }

    setPipeline(pipeline: PipelineInfo) {
        this.pipeline = pipeline;
        this.notify();
    }

    notify() {
        this.listeners.map(l => l());
    }

    addListener(fn: Function) {
        this.listeners.push(fn);
    }

    removeListener(fn: Function) {
        const idx = this.listeners.indexOf(fn);
        this.listeners.splice(idx, 1);
    }
}

const pipelineStore = new PipelineStore();

export default pipelineStore;
