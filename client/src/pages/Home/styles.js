import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

export const Header = styled.div`
  overflow: hidden;
  border-bottom-left-radius: 50px;
  border-bottom-right-radius: 50px;
  padding: 30px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  background-image: url(${props => props.backgroundImage});
`;

export const Bar = styled.div`
  height: 72px;
  background-color: #fff;
  border-radius: 40px;
  padding-right: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Herb = styled.img`
  height: 50px;
  width: 50px;
  margin-left: 10px;
  margin-right: 14px;
  object-fit: contain;
`;

export const HeaderTitle = styled.span`
  font-size: 16px;
  color: #313137;
  font-family: 'Inter', sans-serif;
  font-weight: 300;
`;

export const HeaderRight = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const HeaderVakancies = styled.div`
  margin-right: 50px;
  font-size: 16px;
  color: #313137;
`;

export const HeaderRightLogin = styled.button`
  padding: 10px 40px;
  background-color: #2637A1;
  border-radius: 46px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #1d2b7a;
  }
`;

export const HeaderRightLoginLink = styled.span`
  color: #FFFFFF;
  text-decoration: none;
  font-size: 16px;
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
`;

export const UserName = styled.span`
  color: #313137;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
`;

export const ProfileIconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #2637A1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

export const ProfileIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 55px;
  right: 0;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 10px 0;
  z-index: 10;
  min-width: 180px;
`;

export const DropdownItem = styled.div`
  padding: 10px 18px;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  color: ${props => props.danger ? '#d9534f' : '#313137'};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const Title = styled.h1`
  font-size: 72px;
  color: #fff;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  margin-top: 180px;
  margin-bottom: 0;
  line-height: 1.1;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

export const Text = styled.p`
  margin-top: 30px;
  margin-bottom: 35px;
  font-size: 24px;
  color: #fff;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  max-width: 450px;
  line-height: 1.4;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

export const InputContainer = styled.div`
  height: 62px;
  background-color: #fff;
  border-radius: 38px;
  display: flex;
  align-items: center;
  padding-left: 30px;
  max-width: 1100px;
  position: relative;
  z-index: 2;
`;

export const Input = styled.input`
  flex: 1;
  color: #000;
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 20px;
  border: none;
  outline: none;
  background: transparent;
`;

export const SearchButton = styled.button`
  background-color: #2637A1;
  height: 44px;
  width: 44px;
  border-radius: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #1d2b7a;
  }
`;

export const Main = styled.main`
  padding: 20px;
`;

export const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 12px 0;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

export const LoadingText = styled.p`
  font-size: 20px;
  color: #313137;
  font-family: 'Raleway', sans-serif;
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
`;

export const ErrorText = styled.p`
  font-size: 24px;
  color: #ff4444;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  margin-bottom: 10px;
`;

export const ErrorSubtext = styled.p`
  font-size: 16px;
  color: #666;
  font-family: 'Raleway', sans-serif;
`;

export const NoJobs = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

export const NoJobsText = styled.p`
  font-size: 20px;
  color: #666;
  font-family: 'Raleway', sans-serif;
`;

export const Item = styled.div`
  padding: 30px;
  background-color: #FAFAFF;
  border-radius: 16px;
  flex: 1 1 calc(33.333% - 20px);
  min-width: 300px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  }
`;

export const TitleItem = styled.h3`
  color: #313137;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 30px;
  margin-bottom: 20px;
  margin-top: 0;
  line-height: 1.2;
`;

export const RateContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export const Price = styled.span`
  color: #25258E;
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 20px;
  margin-right: 12px;
`;

export const Rate = styled.span`
  color: #313137;
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 20px;
`;

export const TextItem = styled.p`
  display: flex;
  justify-content: start;
  color: #313137;
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 20px;
  margin-bottom: 40px;
  line-height: 1.4;
`;

export const MoreLink = styled(Link)`
  text-decoration: none;
`;

export const More = styled.span`
  color: #25258E;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 20px;
`;

export const CategoryContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 10px;
  margin-bottom: 20px;
`;

export const Category = styled.div`
  display: flex;
  flex-direction: row;
  padding: 7px 12px;
  border-radius: 9px;
  background-color: #E8F6FF;
  margin-bottom: 10px;
  margin-right: 10px;
`;

export const CategoryText = styled.span`
  color: #00516F;
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: 14px;
`;

