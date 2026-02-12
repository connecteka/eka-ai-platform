import type { Meta, StoryObj } from '@storybook/react';
import { Badge, JobStatusBadge, PriorityBadge } from '../components/shared/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Shared/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#09090b' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'error', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Default
export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
    size: 'md',
  },
};

// Variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

// Job Status Badges
export const JobStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <JobStatusBadge status="Pending" />
      <JobStatusBadge status="In-Progress" />
      <JobStatusBadge status="Completed" />
      <JobStatusBadge status="Cancelled" />
      <JobStatusBadge status="On-Hold" />
    </div>
  ),
};

// Priority Badges
export const Priorities: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PriorityBadge priority="Low" />
      <PriorityBadge priority="Medium" />
      <PriorityBadge priority="High" />
      <PriorityBadge priority="Urgent" />
    </div>
  ),
};

// Complex example
export const ComplexExample: Story = {
  render: () => (
    <div className="space-y-4 p-4 bg-white/5 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-gray-300">Job Status:</span>
        <JobStatusBadge status="In-Progress" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">Priority:</span>
        <PriorityBadge priority="High" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">AI Status:</span>
        <Badge variant="success">Analyzing</Badge>
      </div>
    </div>
  ),
};
