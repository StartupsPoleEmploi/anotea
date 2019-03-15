describe('Login page', function() {
    it('should have a title', function() {
      browser.get('https://anotea.beta.pole-emploi.fr/admin/');
  
      expect(browser.getTitle()).toEqual('Espace Anotea');
    });
  });