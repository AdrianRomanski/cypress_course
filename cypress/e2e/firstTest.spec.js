describe('Test with backend', () => {

  beforeEach('login to application', () => {
    cy.intercept({method: 'Get', path: 'tags'}, {fixture: 'tags.json'})
    cy.loginToApplication();
  })

  it('login to application', () => {
    cy.log('Yaaay we logged in');
  })

  it('verify correct request and response', () => {

    cy.intercept('POST', 'https://conduit-api.bondaracademy.com/api/articles/')
        .as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('This is the title ' + Math.random());
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then(xhr => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal('This is a body of the article');
      expect(xhr.response.body.article.description).to.equal('This is a description');
    })
  })

  it('verify popular tag are displayed', () => {
    cy.get('.tag-list')
        .should('contain', 'cypress')
        .should('contain', 'automation')
        .should('contain', 'testing')
  })

  it('verify global feed likes count', () => {
    cy.intercept('GET', 'https://conduit-api.bondaracademy.com/api/articles/feed*',
        {"articles": [], "articlesCount": 0})
    cy.intercept('GET', 'https://conduit-api.bondaracademy.com/api/articles*',
        {fixture: 'articles.json'})

    cy.contains('Global Feed').click();
    cy.get('app-article-list button').then(heartList => {
      expect(heartList[0]).to.contain('1');
      expect(heartList[1]).to.contain('5');
    })

    cy.fixture('articles').then(file => {
      const articleLink = file.articles[1].slug;
      file.articles[1].favoritesCount = 11;
      cy.intercept('POST',
          `https://conduit-api.bondaracademy.com/api/articles/${articleLink}/favorite`, file)
    })

    cy.get('app-article-list button').eq(1).click().should('contain', '6');

  })

  it('intercepting and modifying the request and response', () => {

    // cy.intercept('POST', '**/articles', (req) => {
    //   req.body.article.description = "This is a description 2"
    // }).as('postArticles');

    cy.intercept('POST', '**/articles', (req) => {
      req.reply(res => {
        // expect(res.body.article.description).to('This is a description');
        req.body.article.description = "This is a description 2"
      })
    }).as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('This is the title ' + Math.random());
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then(xhr => {
      console.log('logging', xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal('This is a body of the article');
      expect(xhr.response.body.article.description).to.equal('This is a description');
    })
  })


  it.only('delete a new article in global feed', () => {
    const bodyRequest = {
      article: {
        "title": "testing title " + Math.random(),
        "description": "deleting",
        "body": "deleting is fun",
        "tagList": []
      }
    };
    cy.get('@token').then(token => {
      cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/articles/',
        headers: {'Authorization': 'Token ' + token},
        method: 'POST',
        body: bodyRequest
      }).then(response => {
        expect(response.status).to.equal(201);
      })
    });
    cy.contains('Global Feed').click();
    cy.get('.article-preview').first().click();
    // cy.get('.article-actions').contains('Delete Article').click();

        //
        // cy.request({
        //   url: 'https://conduit-api.bondaracademy.com/api/articles*',
        //   headers: {'Authorization': 'Token ' + token},
        //   method: 'GET',
        //   body:bodyRequest
        // }).its('body').then(body => {
        //   expect(body).to.not.equal('Request from Api');
        // });
    })
  })
