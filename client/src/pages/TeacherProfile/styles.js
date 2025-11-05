import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;

export const Header = styled.div`
  overflow: hidden;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  padding: 30px;
  background-size: cover;
  background-position: center;
  background-image: ${props => props.backgroundImage ? `url(${props.backgroundImage})` : 'none'};
`;

export const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  background-color: #fff;
  border-radius: 40px;
  padding: 0 20px;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const Herb = styled.img`
  height: 40px;
  margin-right: 12px;
`;

export const HeaderTitle = styled.span`
  font-size: 18px;
  color: #313137;
  font-family: 'Raleway', sans-serif;
`;

export const LogoutButton = styled.button`
  background-color: #2637A1;
  color: #fff;
  border: none;
  border-radius: 46px;
  padding: 10px 24px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #1d2b7a;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const Title = styled.h1`
  font-size: 60px;
  color: #fff;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  margin-top: 120px;
  margin-bottom: 10px;
`;

export const Text = styled.p`
  font-size: 20px;
  color: #fff;
  max-width: 500px;
  font-family: 'Raleway', sans-serif;
`;

export const Main = styled.main`
  padding: 20px;
`;

export const Section = styled.section`
  background-color: #FAFAFF;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const SectionTitle = styled.h2`
  font-size: 24px;
  color: #25258E;
  margin-bottom: 20px;
  font-family: 'Raleway', sans-serif;
`;

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const Input = styled.input`
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #ddd;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
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
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #ddd;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2637A1;
  }

  &::placeholder {
    color: #999;
  }
`;

export const FileInput = styled.input`
  margin-bottom: 15px;
`;

export const FilesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const FileCard = styled.div`
  background-color: #E8F6FF;
  border-radius: 10px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const FileLink = styled.a`
  color: #2637A1;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

export const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #d9534f;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

export const NoFiles = styled.p`
  color: #666;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
`;

export const JobList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const JobItem = styled.li`
  background: #E8F6FF;
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;

  strong {
    color: #25258E;
    font-weight: 600;
  }
`;

export const TextCenter = styled.p`
  text-align: center;
  margin-top: 50px;
  font-size: 20px;
  font-family: 'Inter', sans-serif;
  color: #313137;
`;

export const LoginButton = styled.button`
  margin: 20px auto;
  display: block;
  background-color: #2637A1;
  color: #fff;
  border: none;
  border-radius: 46px;
  padding: 12px 40px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #1d2b7a;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ButtonBack = styled.button`
  background-color: transparent;
  color: #2637A1;
  border: 2px solid #2637A1;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #2637A1;
    color: #fff;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

