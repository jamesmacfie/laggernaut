type State = 'pending' | 'active' | 'inactive';

interface StatePillProps {
  state: State;
}

const stateStyles = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
} as const;

export const StatePill = ({ state }: StatePillProps) => {
  return (
    <span className={`px-2 py-1 text-sm rounded ${stateStyles[state]}`}>
      {state}
    </span>
  );
};
