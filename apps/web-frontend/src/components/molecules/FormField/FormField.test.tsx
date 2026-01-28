import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders label and helper text', () => {
    render(
      <FormField label="Name" helper="Provided by user">
        <input />
      </FormField>
    );

    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/provided by user/i)).toBeInTheDocument();
  });
});
