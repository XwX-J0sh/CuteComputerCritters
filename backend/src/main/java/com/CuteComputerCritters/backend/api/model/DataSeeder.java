package com.CuteComputerCritters.backend.api.model;

import com.CuteComputerCritters.backend.api.model.Food.EnumFoodType;
import com.CuteComputerCritters.backend.api.model.Food.Food;
import com.CuteComputerCritters.backend.api.model.User.EnumRole;
import com.CuteComputerCritters.backend.api.model.User.Role;
import com.CuteComputerCritters.backend.api.model.medicine.EnumMedicineType;
import com.CuteComputerCritters.backend.api.model.medicine.Medicine;
import com.CuteComputerCritters.backend.api.repository.FoodRepository;
import com.CuteComputerCritters.backend.api.repository.MedicineRepository;
import com.CuteComputerCritters.backend.api.repository.RoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import static com.CuteComputerCritters.backend.api.model.medicine.EnumMedicineType.BAND_AID;

@Component
@AllArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final FoodRepository foodRepository;
    private final MedicineRepository medicineRepository;

    @Override
    public void run(String... args) {
        if(roleRepository.count() == 0) {
            roleRepository.save(new Role(EnumRole.USER));
            roleRepository.save(new Role(EnumRole.ADMIN));
        }

        if(medicineRepository.count() == 0) {
            medicineRepository.save(new Medicine(EnumMedicineType.BAND_AID));
            medicineRepository.save(new Medicine(EnumMedicineType.PILL));
        }

        if(foodRepository.count() == 0) {
            foodRepository.save(new Food("Cake", EnumFoodType.SNACK, 3));
            foodRepository.save(new Food("Bread", EnumFoodType.MEAL, 5));
            foodRepository.save(new Food("Candy", EnumFoodType.SNACK, 1));
            foodRepository.save(new Food("Salad", EnumFoodType.MEAL, 4));
            foodRepository.save(new Food("Rice", EnumFoodType.MEAL, 5));
        }
    }
}
