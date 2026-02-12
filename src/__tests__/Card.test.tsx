import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/shared/Card';

describe('Card Component', () => {
  it('renders card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeDefined();
    expect(screen.getByText('Card Description')).toBeDefined();
    expect(screen.getByText('Card Content')).toBeDefined();
    expect(screen.getByText('Card Footer')).toBeDefined();
  });

  it('applies dark theme classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    
    expect(card).toHaveClass('bg-background-alt');
    expect(card).toHaveClass('border-border');
  });

  it('renders CardTitle with correct styling', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText('Title');
    
    expect(title).toHaveClass('text-text-primary');
  });
});
