import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label text', () => {
    render(<Input label="Email" />);
    expect(screen.getByText(/email/i)).toBeInTheDocument();
  });
});
