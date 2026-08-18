/**
 * Renders a relationship path as connected nodes and labelled edges, e.g.
 *
 *   (Developer) --HAS_SKILL--> (Skill) <--REQUIRES-- (Job)
 *
 * A deliberately simple HTML/CSS visual rather than a graph rendering library:
 * its job is to explain *how* a recommendation was reached, and a fixed path is
 * clearer for that than an interactive node-link diagram would be.
 */

const KIND_BY_LABEL = {
  Developer: 'developer',
  Skill: 'skill',
  Project: 'project',
  Job: 'job',
  Company: 'company',
};

function GraphNode({ label }) {
  const kind = KIND_BY_LABEL[label] ?? 'skill';
  return (
    <span className={`graph-node graph-node--${kind}`}>
      <span className="graph-node__dot" />
      {label}
    </span>
  );
}

function GraphEdge({ label, direction = 'forward' }) {
  return (
    <span className="graph-edge">
      {direction === 'back' && <span aria-hidden="true">&lt;</span>}
      <span className="graph-edge__line" />
      {label}
      <span className="graph-edge__line" />
      {direction === 'forward' && <span aria-hidden="true">&gt;</span>}
    </span>
  );
}

/**
 * @param {{ steps: Array<{ node: string, edge?: string, direction?: 'forward'|'back' }> }} props
 *   `edge` describes the relationship *leading into* that node.
 */
export function GraphPath({ steps, caption }) {
  const description = steps
    .map((step) => (step.edge ? `${step.edge} ${step.node}` : step.node))
    .join(' then ');

  return (
    <div className="graph-path">
      <div className="graph-path__row">
        {steps.map((step, index) => (
          <span key={`${step.node}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {step.edge && <GraphEdge label={step.edge} direction={step.direction} />}
            <GraphNode label={step.node} />
          </span>
        ))}
      </div>
      <p className="visually-hidden">Relationship path: {description}</p>
      {caption && <p className="graph-path__caption">{caption}</p>}
    </div>
  );
}

/** The two traversals the recommendations are built from. */
export const DIRECT_PATH = [
  { node: 'Developer' },
  { node: 'Skill', edge: 'HAS_SKILL' },
  { node: 'Job', edge: 'REQUIRES', direction: 'back' },
  { node: 'Company', edge: 'POSTED_BY' },
];

/** The direct path without the company hop, for narrow columns. */
export const DIRECT_PATH_SHORT = [
  { node: 'Developer' },
  { node: 'Skill', edge: 'HAS_SKILL' },
  { node: 'Job', edge: 'REQUIRES', direction: 'back' },
];

export const PROJECT_PATH = [
  { node: 'Developer' },
  { node: 'Project', edge: 'WORKED_ON' },
  { node: 'Skill', edge: 'USES' },
  { node: 'Job', edge: 'REQUIRES', direction: 'back' },
];
