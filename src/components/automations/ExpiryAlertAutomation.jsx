import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { AlertTriangle, Clock, ChefHat, Trash2 } from 'lucide-react'

function ExpiryAlertAutomation({ products = [], onRecipeSuggestion }) {
  const [expiringProducts, setExpiringProducts] = useState([])
  const [showRecipes, setShowRecipes] = useState(false)
  const [suggestedRecipes, setSuggestedRecipes] = useState([])
  const [isAlertHidden, setIsAlertHidden] = useState(false)

  // Controlla prodotti in scadenza ogni volta che cambiano i prodotti
  useEffect(() => {
    const checkExpiringProducts = () => {
      const now = new Date()
      const expiring = products.filter(product => {
        if (!product.expiryDate) return false
        const expiryDate = new Date(product.expiryDate)
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0
      })
      setExpiringProducts(expiring)
      
      // Reset dell'alert nascosto se ci sono nuovi prodotti in scadenza
      if (expiring.length > 0) {
        setIsAlertHidden(false)
      }
    }

    checkExpiringProducts()
  }, [products])

  // Genera ricette suggerite basate sui prodotti in scadenza
  const generateRecipeSuggestions = () => {
    const recipes = []
    
    expiringProducts.forEach(product => {
      const recipe = generateRecipeForProduct(product)
      if (recipe) {
        recipes.push(recipe)
      }
    })

    setSuggestedRecipes(recipes)
    setShowRecipes(true)
  }

  // Funzione per rimuovere l'alert
  const handleRemoveAlert = () => {
    setIsAlertHidden(true)
  }

  const generateRecipeForProduct = (product) => {
    const recipeDatabase = {
      'Mozzarella di Bufala': {
        name: 'Insalata Caprese',
        ingredients: ['Mozzarella di Bufala', 'Pomodoro', 'Basilico', 'Olio EVO'],
        instructions: 'Taglia mozzarella e pomodoro a fette, alterna su piatto, guarnisci con basilico e olio.',
        difficulty: 'Facile',
        time: '10 minuti'
      },
      'Parmigiano Reggiano': {
        name: 'Risotto al Parmigiano',
        ingredients: ['Riso Carnaroli', 'Parmigiano Reggiano', 'Burro', 'Brodo'],
        instructions: 'Prepara risotto classico, manteca con parmigiano e burro.',
        difficulty: 'Media',
        time: '25 minuti'
      },
      'Prosciutto Crudo': {
        name: 'Antipasto Prosciutto e Melone',
        ingredients: ['Prosciutto Crudo', 'Melone', 'Rucola'],
        instructions: 'Avvolgi fette di prosciutto su cubetti di melone, guarnisci con rucola.',
        difficulty: 'Facile',
        time: '5 minuti'
      },
      'Salmone': {
        name: 'Salmone al Forno con Erbe',
        ingredients: ['Salmone', 'Limone', 'Erbe aromatiche', 'Olio EVO'],
        instructions: 'Condisci salmone con erbe, limone e olio, cuoci in forno a 180°C per 15 min.',
        difficulty: 'Facile',
        time: '20 minuti'
      },
      'Basilico Fresco': {
        name: 'Pesto alla Genovese',
        ingredients: ['Basilico Fresco', 'Parmigiano', 'Pine Nuts', 'Olio EVO', 'Aglio'],
        instructions: 'Frulla tutti gli ingredienti fino a ottenere una crema omogenea.',
        difficulty: 'Facile',
        time: '10 minuti'
      }
    }

    return recipeDatabase[product.name] || {
      name: `Ricetta con ${product.name}`,
      ingredients: [product.name, 'Altri ingredienti disponibili'],
      instructions: 'Crea una ricetta utilizzando questo ingrediente prima che scada.',
      difficulty: 'Media',
      time: '15 minuti'
    }
  }

  if (expiringProducts.length === 0 || isAlertHidden) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Prodotti in Scadenza
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-orange-700">
            <p className="font-medium mb-2">
              {expiringProducts.length} prodotto{expiringProducts.length > 1 ? 'i' : ''} in scadenza:
            </p>
            <ul className="space-y-1">
              {expiringProducts.map(product => (
                <li key={product.id} className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{product.name}</span>
                  <span className="text-xs">
                    (scade il {new Date(product.expiryDate).toLocaleDateString('it-IT')})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateRecipeSuggestions}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              <ChefHat className="h-4 w-4 mr-1" />
              Suggerisci Ricette
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-300"
              onClick={handleRemoveAlert}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Rimuovi Alert
            </Button>
          </div>

          {showRecipes && suggestedRecipes.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <h4 className="font-medium mb-2">Ricette Suggerite:</h4>
              <div className="space-y-2">
                {suggestedRecipes.map((recipe, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <h5 className="font-medium text-sm">{recipe.name}</h5>
                    <p className="text-xs text-gray-600">
                      Tempo: {recipe.time} • Difficoltà: {recipe.difficulty}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      {recipe.instructions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ExpiryAlertAutomation 