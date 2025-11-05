import styled from 'styled-components';

export const SchoolProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

export const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;

  h1 {
    font-size: 32px;
    font-weight: 600;
    color: #25258E;
    margin: 0;
    font-family: 'Raleway', sans-serif;
  }
`;

export const ProfileSection = styled.div`
  background-color: #FAFAFF;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 24px;
    color: #25258E;
    margin-bottom: 20px;
    font-family: 'Raleway', sans-serif;
  }
`;

export const ProfileForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  color: #313137;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
`;

export const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2637A1;
  }

  &::placeholder {
    color: #999;
  }
`;

export const Textarea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2637A1;
  }

  &::placeholder {
    color: #999;
  }
`;

export const EmailInfo = styled.p`
  margin: 16px 0;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #313137;

  strong {
    color: #25258E;
  }
`;

export const AddJobSection = styled.div`
  background-color: #FAFAFF;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 24px;
    color: #25258E;
    margin-bottom: 20px;
    font-family: 'Raleway', sans-serif;
  }
`;

export const JobForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const JobsSection = styled.div`
  background-color: #FAFAFF;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 24px;
    color: #25258E;
    margin-bottom: 20px;
    font-family: 'Raleway', sans-serif;
  }
`;

export const JobsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const JobCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

export const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #25258E;
    margin: 0;
    font-family: 'Raleway', sans-serif;
  }
`;

export const JobInfo = styled.p`
  margin: 8px 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #313137;
  line-height: 1.6;

  strong {
    color: #25258E;
    font-weight: 600;
  }
`;

export const ButtonPrimary = styled.button`
  background-color: #2637A1;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #1d2b7a;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ButtonDanger = styled.button`
  background-color: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #ff7875;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 18px;
  color: #666;
  font-family: 'Inter', sans-serif;
`;

export const EmptyMessage = styled.p`
  text-align: center;
  color: #999;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  padding: 40px 0;
`;

