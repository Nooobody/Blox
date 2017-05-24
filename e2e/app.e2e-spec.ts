import { BloxPage } from './app.po';

describe('blox App', () => {
  let page: BloxPage;

  beforeEach(() => {
    page = new BloxPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
