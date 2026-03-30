package com.skincare.ecommerce.Helper;

import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.entity.ProductSpecifications;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class ProductExcelHelper {

    public static List<Product> parseExcel(InputStream is) {

        List<Product> products = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null) continue;

                String name = getCellValue(formatter, row, 0);
                if (name.isEmpty()) continue;

                Product product = new Product();
                product.setName(name);

                // 🔥 EMBEDDED SPECIFICATIONS
                ProductSpecifications specs = new ProductSpecifications();

                // ✅ CATEGORY (UPPERCASE SAFETY)
                String category = getCellValue(formatter, row, 1);

                product.setSpecifications(specs);

                // ✅ BASIC FIELDS
                product.setDescription(getCellValue(formatter, row, 2));
                product.setPrice(parseBigDecimal(getCellValue(formatter, row, 3)));
                product.setSize(getCellValue(formatter, row, 4));
                product.setStockQuantity(parseInteger(getCellValue(formatter, row, 5)));

                // ✅ PRODUCT TYPE
                String typeValue = getCellValue(formatter, row, 6);
                try {
                    product.setType(
                            typeValue.isEmpty()
                                    ? Product.ProductType.SINGLE
                                    : Product.ProductType.valueOf(typeValue.toUpperCase())
                    );
                } catch (Exception e) {
                    product.setType(Product.ProductType.SINGLE);
                }

                // ✅ ACTIVE FLAG
                product.setActive(parseBoolean(getCellValue(formatter, row, 7)));

                products.add(product);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Excel file", e);
        }

        return products;
    }

    // ---------- Helpers ----------

    private static String getCellValue(DataFormatter formatter, Row row, int index) {
        Cell cell = row.getCell(index);
        return cell == null ? "" : formatter.formatCellValue(cell).trim();
    }

    private static BigDecimal parseBigDecimal(String value) {
        try {
            return value.isEmpty() ? BigDecimal.ZERO : new BigDecimal(value);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private static Integer parseInteger(String value) {
        try {
            return value.isEmpty() ? 0 : Integer.parseInt(value);
        } catch (Exception e) {
            return 0;
        }
    }

    private static boolean parseBoolean(String value) {
        return value.equalsIgnoreCase("true") || value.equals("1");
    }
}
